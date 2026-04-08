#!/bin/bash
# BMad Speak Hook
# Used by Party Mode to handle Agent speech events
#
# Usage: bmad-speak.sh "<Agent Name>" "<Message>"
#
# This hook is optional - if you don't need custom behavior for agent speech,
# this script can simply exit successfully without doing anything.
#
# Potential uses:
# - Log agent conversations to a file
# - Trigger text-to-speech audio output
# - Send messages to an external service
# - Record conversation analytics

AGENT_NAME="$1"
MESSAGE="$2"

# Currently a no-op hook - just exit successfully
# Add custom behavior here if needed
exit 0
