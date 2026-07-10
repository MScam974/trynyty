#!/bin/bash
cd /workspaces/trinity
git add -A
git commit -m "save: $(date +%Y-%m-%d_%H:%M)" || echo "Rien de nouveau"
git push origin main --force-with-lease
