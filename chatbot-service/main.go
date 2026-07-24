package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"regexp"
	"strings"
)

type FAQ struct {
	Keywords []string `json:"keywords"`
	Question string   `json:"question"`
	Answer   string   `json:"answer"`
}

type ChatRequest struct {
	Message string `json:"message"`
}

type ChatResponse struct {
	Answer          string  `json:"answer"`
	MatchedQuestion string  `json:"matched_question,omitempty"`
	Confidence      float64 `json:"confidence"`
}

var (
	faqs       []FAQ
	idf        map[string]float64
	docVectors []map[string]float64
	docNorms   []float64
)

// Stopwords set to filter out noise
var stopwords = map[string]bool{
	"a": true, "about": true, "above": true, "after": true, "again": true, "against": true, "all": true, "am": true,
	"an": true, "and": true, "any": true, "are": true, "as": true, "at": true, "be": true, "because": true,
	"been": true, "before": true, "being": true, "below": true, "between": true, "both": true, "but": true, "by": true,
	"can": true, "could": true, "did": true, "do": true, "does": true, "doing": true, "down": true, "during": true,
	"each": true, "few": true, "for": true, "from": true, "further": true, "had": true, "has": true, "have": true,
	"having": true, "he": true, "her": true, "here": true, "hers": true, "herself": true, "him": true, "himself": true,
	"his": true, "how": true, "i": true, "if": true, "in": true, "into": true, "is": true, "it": true, "its": true,
	"itself": true, "me": true, "more": true, "most": true, "my": true, "myself": true, "no": true, "nor": true,
	"not": true, "of": true, "off": true, "on": true, "once": true, "only": true, "or": true, "other": true,
	"our": true, "ours": true, "ourselves": true, "out": true, "over": true, "own": true, "same": true, "she": true,
	"should": true, "so": true, "some": true, "such": true, "than": true, "that": true, "the": true, "their": true,
	"theirs": true, "them": true, "themselves": true, "then": true, "there": true, "these": true, "they": true,
	"this": true, "those": true, "through": true, "to": true, "too": true, "under": true, "until": true, "up": true,
	"very": true, "was": true, "we": true, "were": true, "what": true, "when": true, "where": true, "which": true,
	"while": true, "who": true, "whom": true, "why": true, "with": true, "you": true, "your": true, "yours": true,
	"yourself": true, "yourselves": true,
}

var cleanRegex = regexp.MustCompile(`[^a-z0-9\s]`)

func tokenize(text string) []string {
	text = strings.ToLower(text)
	text = cleanRegex.ReplaceAllString(text, " ")
	words := strings.Fields(text)
	var tokens []string
	for _, word := range words {
		if !stopwords[word] && len(word) > 1 {
			tokens = append(tokens, word)
		}
	}
	return tokens
}

func initTFIDF() {
	docFrequencies := make(map[string]int)
	allTokens := make([][]string, len(faqs))

	for i, faq := range faqs {
		// Combine question and keywords to form the index document
		docText := faq.Question + " " + strings.Join(faq.Keywords, " ")
		tokens := tokenize(docText)
		allTokens[i] = tokens

		uniqueTokens := make(map[string]bool)
		for _, token := range tokens {
			uniqueTokens[token] = true
		}

		for token := range uniqueTokens {
			docFrequencies[token]++
		}
	}

	// Calculate IDF for each term
	idf = make(map[string]float64)
	numDocs := float64(len(faqs))
	for token, df := range docFrequencies {
		idf[token] = math.Log(1.0 + (numDocs / float64(df)))
	}

	// Compute TF-IDF vectors for FAQs
	docVectors = make([]map[string]float64, len(faqs))
	docNorms = make([]float64, len(faqs))

	for i, tokens := range allTokens {
		tfMap := make(map[string]float64)
		for _, token := range tokens {
			tfMap[token]++
		}

		vector := make(map[string]float64)
		var sqSum float64

		for token, tf := range tfMap {
			tfidfVal := tf * idf[token]
			vector[token] = tfidfVal
			sqSum += tfidfVal * tfidfVal
		}

		docVectors[i] = vector
		docNorms[i] = math.Sqrt(sqSum)
	}

	log.Printf("TF-IDF Chatbot engine initialized successfully with %d Q&As.", len(faqs))
}

func getBestMatch(query string) (int, float64) {
	queryTokens := tokenize(query)
	if len(queryTokens) == 0 {
		return -1, 0.0
	}

	// Compute TF for query
	queryTF := make(map[string]float64)
	for _, token := range queryTokens {
		queryTF[token]++
	}

	// Compute TF-IDF vector for query
	queryVector := make(map[string]float64)
	var querySqSum float64
	for token, tf := range queryTF {
		if idfVal, exists := idf[token]; exists {
			tfidfVal := tf * idfVal
			queryVector[token] = tfidfVal
			querySqSum += tfidfVal * tfidfVal
		}
	}

	queryNorm := math.Sqrt(querySqSum)
	if queryNorm == 0 {
		return -1, 0.0
	}

	bestIdx := -1
	bestScore := -1.0

	for i, docVector := range docVectors {
		var dotProduct float64
		for token, qVal := range queryVector {
			if dVal, exists := docVector[token]; exists {
				dotProduct += qVal * dVal
			}
		}

		var cosineSim float64
		if docNorms[i] > 0 {
			cosineSim = dotProduct / (queryNorm * docNorms[i])
		}

		// Apply exact keyword boosting
		keywordMatches := 0
		for _, kw := range faqs[i].Keywords {
			for _, qTok := range queryTokens {
				if strings.ToLower(kw) == qTok {
					keywordMatches++
				}
			}
		}

		// A boost of 0.15 for each exact keyword match
		boost := float64(keywordMatches) * 0.15
		score := cosineSim + boost

		if score > bestScore {
			bestScore = score
			bestIdx = i
		}
	}

	return bestIdx, bestScore
}

func handleChat(w http.ResponseWriter, r *http.Request) {
	// Add CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ChatRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	bestIdx, score := getBestMatch(req.Message)
	threshold := 0.18

	var resp ChatResponse
	if bestIdx != -1 && score >= threshold {
		resp = ChatResponse{
			Answer:          faqs[bestIdx].Answer,
			MatchedQuestion: faqs[bestIdx].Question,
			Confidence:      score,
		}
	} else {
		resp = ChatResponse{
			Answer:     "I'm sorry, I couldn't find an answer to your question about RIT Chennai. Please try rephrasing your question or contact our administrative office at +91 8925977445 or mail@ritchennai.edu.in.",
			Confidence: score,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"UP"}`))
}

func main() {
	// Load FAQs
	file, err := os.ReadFile("qna.json")
	if err != nil {
		log.Fatalf("Failed to read qna.json: %v", err)
	}

	err = json.Unmarshal(file, &faqs)
	if err != nil {
		log.Fatalf("Failed to parse qna.json: %v", err)
	}

	initTFIDF()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	http.HandleFunc("/api/chat", handleChat)
	http.HandleFunc("/api/health", handleHealth)

	log.Printf("Chatbot service listening on port %s...", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%s", port), nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
