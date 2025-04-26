# Define file paths
$inputFile = "QuizSections.json"
$backupFile = "QuizSections_backup.json"
$tempFile = "QuizSections_temp.json"

# Backup the original file
Copy-Item -Path $inputFile -Destination $backupFile -Force
Write-Host "Backup created: $backupFile"

# Read the JSON file as plain text lines
$lines = Get-Content -Path $inputFile

# Initialize counter
$counter = 1

# Prepare temporary file
if (Test-Path $tempFile) { Remove-Item $tempFile }
New-Item -Path $tempFile -ItemType File -Force | Out-Null

# Process each line
foreach ($line in $lines) {
    if ($line -match '"id":\s*"(\d+)"') {
        # Replace numeric ID with counter
        $replacement = '"id": "' + $counter + '"'
        $updatedLine = $line -replace '"id":\s*"\d+"', $replacement
        Add-Content -Path $tempFile -Value $updatedLine
        $counter++
    } else {
        Add-Content -Path $tempFile -Value $line
    }
}

# Overwrite the original file with the updated one
Move-Item -Path $tempFile -Destination $inputFile -Force
Write-Host "QuizSections.json has been updated with new question IDs."
