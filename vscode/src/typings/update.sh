#! /usr/bin/env bash

# Fetch files from vscode repo
# Check latest file list at https://github.com/microsoft/vscode/tree/main/src/vscode-dts

DTS_DIR=https://raw.githubusercontent.com/microsoft/vscode/main/src/vscode-dts

curl --remote-name-all -L $DTS_DIR/{vscode.proposed.chat.d.ts,vscode.proposed.chatAgents.d.ts,vscode.proposed.chatAgents2.d.ts,vscode.proposed.chatAgents2Additions.d.ts,vscode.proposed.chatProvider.d.ts,vscode.proposed.chatRequestAccess.d.ts,vscode.proposed.chatVariables.d.ts,vscode.proposed.interactive.d.ts}
