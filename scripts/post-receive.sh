#!/bin/bash
# Test commit to verify automated email push report notification system


export SENDER_EMAIL="krishnaowoxd@gmail.com"
export SENDER_PASSWORD="qkwy lwtc snlr pree"
export RECIPIENT_EMAIL="dorutoslayer@gmail.com"

while read oldrev newrev refname
do
    BRANCH=$(echo $refname | cut -d/ -f3)
    COMMIT_HASH=$(git log -1 --format="%h" $newrev)
    AUTHOR=$(git log -1 --format="%an <%ae>" $newrev)
    MESSAGE=$(git log -1 --format="%B" $newrev)
    TIMESTAMP=$(git log -1 --format="%cd" --date=local $newrev)
    CHANGED_FILES=$(git diff-tree --no-commit-id --name-status -r $newrev | head -n 15)

    python3 /var/www/freshers-hub/scripts/send_git_email.py \
        "$BRANCH" \
        "$AUTHOR" \
        "$COMMIT_HASH" \
        "$TIMESTAMP" \
        "$MESSAGE" \
        "$CHANGED_FILES"

done
