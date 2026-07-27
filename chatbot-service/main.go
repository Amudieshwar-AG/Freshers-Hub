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
	Keywords  []string `json:"keywords"`
	Question  string   `json:"question"`
	Questions []string `json:"questions"`
	Answer    string   `json:"answer"`
}

type IndexedDoc struct {
	FAQIndex int
	Question string
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
	faqs         []FAQ
	indexedDocs  []IndexedDoc
	idf          map[string]float64
	docTerms     []map[string]float64 // term frequency for each document
	docLengths   []float64             // length of each document
	avgDocLength float64
	vocabSet     map[string]bool
)

var synonymMap = map[string]string{
	"timings":       "hours",
	"timing":        "hours",
	"schedule":      "hours",
	"time":          "hours",
	"fees":          "fee",
	"payment":       "fee",
	"pay":           "fee",
	"canteen":       "cafeteria",
	"mess":          "cafeteria",
	"food":          "cafeteria",
	"bus":           "transport",
	"buses":         "transport",
	"route":         "transport",
	"routes":        "transport",
	"admission":     "admissions",
	"enroll":        "admissions",
	"join":          "admissions",
	"phone":         "contact",
	"number":        "contact",
	"call":          "contact",
	"email":         "mail",
	"emailaddress":  "mail",
	"course":        "courses",
	"departments":   "courses",
	"branches":      "courses",
	"programs":      "courses",
	"hostels":       "hostel",
	"rooms":         "hostel",
	"stay":          "hostel",
	"accommodation": "hostel",
}

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

func stem(word string) string {
	if strings.HasSuffix(word, "sses") {
		return word[:len(word)-2]
	}
	if strings.HasSuffix(word, "ies") {
		return word[:len(word)-3] + "y"
	}
	if strings.HasSuffix(word, "ss") {
		return word
	}
	if strings.HasSuffix(word, "s") && !strings.HasSuffix(word, "us") && !strings.HasSuffix(word, "as") && !strings.HasSuffix(word, "is") {
		return word[:len(word)-1]
	}
	if strings.HasSuffix(word, "eed") {
		return word[:len(word)-1]
	}
	if strings.HasSuffix(word, "ing") {
		w := word[:len(word)-3]
		if len(w) > 3 && w[len(w)-1] == w[len(w)-2] {
			c := w[len(w)-1]
			if c == 'n' || c == 't' || c == 'p' || c == 'd' || c == 'g' {
				w = w[:len(w)-1]
			}
		}
		return w
	}
	if strings.HasSuffix(word, "ed") {
		return word[:len(word)-2]
	}
	if strings.HasSuffix(word, "ly") {
		return word[:len(word)-2]
	}
	if strings.HasSuffix(word, "tional") {
		return word[:len(word)-6] + "tion"
	}
	return word
}

func getBigrams(tokens []string) []string {
	var bigrams []string
	for i := 0; i < len(tokens)-1; i++ {
		bigrams = append(bigrams, tokens[i]+"_"+tokens[i+1])
	}
	return bigrams
}

func soundex(word string) string {
	if len(word) == 0 {
		return ""
	}
	word = strings.ToLower(word)
	first := string(word[0])

	mappings := map[rune]rune{
		'b': '1', 'f': '1', 'p': '1', 'v': '1',
		'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
		'd': '3', 't': '3',
		'l': '4',
		'm': '5', 'n': '5',
		'r': '6',
	}

	var code []rune
	code = append(code, rune(first[0]))

	prevCode := '0'
	if c, exists := mappings[rune(word[0])]; exists {
		prevCode = c
	}

	for i := 1; i < len(word); i++ {
		r := rune(word[i])
		if r == 'a' || r == 'e' || r == 'i' || r == 'o' || r == 'u' || r == 'y' || r == 'h' || r == 'w' {
			continue
		}
		if c, exists := mappings[r]; exists {
			if c != prevCode {
				code = append(code, c)
				prevCode = c
			}
		} else {
			prevCode = '0'
		}
		if len(code) == 4 {
			break
		}
	}

	for len(code) < 4 {
		code = append(code, '0')
	}

	return string(code)
}

func tokenize(text string) []string {
	text = strings.ToLower(text)
	text = cleanRegex.ReplaceAllString(text, " ")
	words := strings.Fields(text)
	var tokens []string
	for _, word := range words {
		// Resolve synonyms
		if syn, exists := synonymMap[word]; exists {
			word = syn
		}
		// Apply stemming
		word = stem(word)
		if !stopwords[word] && len(word) > 1 {
			tokens = append(tokens, word)
		}
	}
	return tokens
}

func levenshtein(s, t string) int {
	sLen := len(s)
	tLen := len(t)
	if sLen == 0 {
		return tLen
	}
	if tLen == 0 {
		return sLen
	}

	d := make([][]int, sLen+1)
	for i := range d {
		d[i] = make([]int, tLen+1)
		d[i][0] = i
	}
	for j := range d[0] {
		d[0][j] = j
	}

	for i := 1; i <= sLen; i++ {
		for j := 1; j <= tLen; j++ {
			cost := 1
			if s[i-1] == t[j-1] {
				cost = 0
			}
			d[i][j] = minInt(d[i-1][j]+1, minInt(d[i][j-1]+1, d[i-1][j-1]+cost))
		}
	}
	return d[sLen][tLen]
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func correctToken(token string) string {
	if vocabSet[token] {
		return token
	}
	if len(token) < 4 {
		return token
	}

	// Try Soundex first (phonetic correction)
	tokenSx := soundex(token)
	for vocabWord := range vocabSet {
		if soundex(vocabWord) == tokenSx {
			return vocabWord
		}
	}

	// Fallback to Levenshtein distance
	bestWord := token
	bestDist := 999

	for vocabWord := range vocabSet {
		diff := len(vocabWord) - len(token)
		if diff < 0 {
			diff = -diff
		}
		if diff > 2 {
			continue
		}

		dist := levenshtein(token, vocabWord)
		if dist < bestDist {
			bestDist = dist
			bestWord = vocabWord
		}
	}

	maxAllowedDist := 1
	if len(token) >= 6 {
		maxAllowedDist = 2
	}

	if bestDist <= maxAllowedDist {
		return bestWord
	}
	return token
}

func tokenizeQuery(query string) []string {
	tokens := tokenize(query)
	var corrected []string
	for _, token := range tokens {
		corrected = append(corrected, correctToken(token))
	}
	return corrected
}

func initTFIDF() { // keeping name initTFIDF for backwards compatibility
	// Build indexedDocs
	indexedDocs = nil
	for i, faq := range faqs {
		if faq.Question != "" {
			indexedDocs = append(indexedDocs, IndexedDoc{FAQIndex: i, Question: faq.Question})
		}
		for _, q := range faq.Questions {
			if q != "" {
				indexedDocs = append(indexedDocs, IndexedDoc{FAQIndex: i, Question: q})
			}
		}
	}

	allTokens := make([][]string, len(indexedDocs))
	var totalLength float64

	for i, doc := range indexedDocs {
		faq := faqs[doc.FAQIndex]
		docText := doc.Question + " " + strings.Join(faq.Keywords, " ")
		tokens := tokenize(docText)
		bigrams := getBigrams(tokens)
		tokens = append(tokens, bigrams...)
		allTokens[i] = tokens
		totalLength += float64(len(tokens))
	}

	avgDocLength = totalLength / float64(len(indexedDocs))

	docFrequencies := make(map[string]int)
	docTerms = make([]map[string]float64, len(indexedDocs))
	docLengths = make([]float64, len(indexedDocs))

	for i, tokens := range allTokens {
		docLengths[i] = float64(len(tokens))
		tfMap := make(map[string]float64)
		for _, token := range tokens {
			tfMap[token]++
		}
		docTerms[i] = tfMap

		uniqueTokens := make(map[string]bool)
		for _, token := range tokens {
			uniqueTokens[token] = true
		}
		for token := range uniqueTokens {
			docFrequencies[token]++
		}
	}

	// Populate vocabSet
	vocabSet = make(map[string]bool)
	for _, tokens := range allTokens {
		for _, token := range tokens {
			vocabSet[token] = true
		}
	}

	// Calculate BM25 IDF for each term
	idf = make(map[string]float64)
	numDocs := float64(len(indexedDocs))
	for token, df := range docFrequencies {
		val := (numDocs - float64(df) + 0.5) / (float64(df) + 0.5)
		if val < 0 {
			val = 0.0001
		}
		idf[token] = math.Log(val + 1.0)
	}

	log.Printf("BM25 Chatbot engine initialized successfully with %d Q&As (%d indexed question variants, avg doc length: %.2f).", len(faqs), len(indexedDocs), avgDocLength)
}

func getBestMatch(query string) (int, float64, string) {
	queryTokens := tokenizeQuery(query)
	if len(queryTokens) == 0 {
		return -1, 0.0, ""
	}

	qBigrams := getBigrams(queryTokens)
	queryTokens = append(queryTokens, qBigrams...)

	bestFAQIdx := -1
	bestScore := -1.0
	var bestMatchedQuestion string

	k1 := 1.2
	b := 0.75

	for i, doc := range indexedDocs {
		faq := faqs[doc.FAQIndex]
		var bm25Score float64

		tfMap := docTerms[i]
		docLen := docLengths[i]

		for _, token := range queryTokens {
			tf := tfMap[token]
			if tf > 0 {
				idfVal := idf[token]
				numerator := tf * (k1 + 1.0)
				denominator := tf + k1*(1.0-b+b*(docLen/avgDocLength))
				bm25Score += idfVal * (numerator / denominator)
			}
		}

		// Apply exact keyword boosting (only on original tokens)
		originalQueryLen := len(queryTokens) - len(qBigrams)
		keywordMatches := 0
		for _, kw := range faq.Keywords {
			for j := 0; j < originalQueryLen; j++ {
				qTok := queryTokens[j]
				if strings.ToLower(kw) == qTok {
					keywordMatches++
				}
			}
		}

		boost := float64(keywordMatches) * 0.15
		score := bm25Score + boost

		if score > bestScore {
			bestScore = score
			bestFAQIdx = doc.FAQIndex
			bestMatchedQuestion = doc.Question
		}
	}

	return bestFAQIdx, bestScore, bestMatchedQuestion
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

	bestIdx, score, matchedQuestion := getBestMatch(req.Message)
	threshold := 0.18

	var resp ChatResponse
	if bestIdx != -1 && score >= threshold {
		resp = ChatResponse{
			Answer:          faqs[bestIdx].Answer,
			MatchedQuestion: matchedQuestion,
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
