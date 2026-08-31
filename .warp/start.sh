#!/usr/bin/env bash

PROJECT_DIR="/Users/bouwe/dev-bouwe/boardkey"
PROJECT_NAME="boardkey"
WARP_CONFIG_DIR="$HOME/.warp/launch_configurations"

# A Warp window is named after its active tab, and every tab in launch.yaml is
# titled "boardkey: ...", so that prefix identifies our window. Needs Accessibility
# permission for whichever app runs this script.
focused=$(osascript <<'APPLESCRIPT' 2>/dev/null
tell application "System Events" to tell process "Warp"
    repeat with w in windows
        if name of w starts with "boardkey: " then
            perform action "AXRaise" of w
            set frontmost to true
            return "yes"
        end if
    end repeat
end tell
return "no"
APPLESCRIPT
)

if [ "$focused" = "yes" ]; then
    exit 0
fi

mkdir -p "$WARP_CONFIG_DIR"

if [ ! -L "$WARP_CONFIG_DIR/${PROJECT_NAME}.yaml" ] && [ ! -f "$WARP_CONFIG_DIR/${PROJECT_NAME}.yaml" ]; then
    ln -s "${PROJECT_DIR}/.warp/launch.yaml" "$WARP_CONFIG_DIR/${PROJECT_NAME}.yaml"
fi

open "warp://launch/$PROJECT_NAME"
