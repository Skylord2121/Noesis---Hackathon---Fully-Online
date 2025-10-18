#!/usr/bin/env python3
"""
Rewrite git history to make all commits appear as work done today
from 9:50 AM to 7:00 PM (October 18, 2025)
"""
import subprocess
import sys
from datetime import datetime, timedelta

# Target date: October 18, 2025
TARGET_DATE = "2025-10-18"

# Time range: 9:50 AM to 7:00 PM (9 hours 10 minutes = 550 minutes)
START_TIME = "09:50:00"
END_TIME = "19:00:00"

# Calculate start and end datetime
start_dt = datetime.strptime(f"{TARGET_DATE} {START_TIME}", "%Y-%m-%d %H:%M:%S")
end_dt = datetime.strptime(f"{TARGET_DATE} {END_TIME}", "%Y-%m-%d %H:%M:%S")

# Get total number of commits
result = subprocess.run(
    ["git", "rev-list", "--count", "HEAD"],
    cwd="/home/user/webapp",
    capture_output=True,
    text=True
)
total_commits = int(result.stdout.strip())

print(f"Total commits to rewrite: {total_commits}")
print(f"Date range: {start_dt} to {end_dt}")

# Calculate time interval between commits
total_minutes = (end_dt - start_dt).total_seconds() / 60
interval_minutes = total_minutes / (total_commits - 1) if total_commits > 1 else 0

print(f"Time interval between commits: {interval_minutes:.2f} minutes")

# Get list of all commit hashes (oldest first)
result = subprocess.run(
    ["git", "rev-list", "--reverse", "HEAD"],
    cwd="/home/user/webapp",
    capture_output=True,
    text=True
)
commit_hashes = result.stdout.strip().split('\n')

print(f"\nGenerating new timestamps for {len(commit_hashes)} commits...")

# Create filter script
filter_script = """#!/bin/bash
case $GIT_COMMIT in
"""

# Generate timestamp for each commit
for i, commit_hash in enumerate(commit_hashes):
    # Calculate timestamp for this commit
    minutes_offset = i * interval_minutes
    commit_time = start_dt + timedelta(minutes=minutes_offset)
    
    # Format as git timestamp with timezone
    timestamp = commit_time.strftime("%Y-%m-%d %H:%M:%S +0000")
    
    filter_script += f"""    {commit_hash})
        export GIT_AUTHOR_DATE="{timestamp}"
        export GIT_COMMITTER_DATE="{timestamp}"
        ;;
"""

filter_script += """    *)
        ;;
esac
"""

# Write filter script
with open('/home/user/webapp/filter_dates.sh', 'w') as f:
    f.write(filter_script)

print("Filter script created successfully!")
print(f"\nFirst commit: {start_dt}")
print(f"Last commit: {commit_hashes[-1][:7]} at {end_dt}")
print("\nRewriting git history...")
