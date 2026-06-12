$lines = Get-Content 'C:\Users\i-seven\.gemini\antigravity\brain\9f0a53ec-e271-4647-854b-f204caa99054\.system_generated\logs\transcript_full.jsonl' -Encoding UTF8
foreach ($line in $lines) {
    if ($line -match '"type":"USER_INPUT"' -and $line -match 'wheelAnimation') {
        $json = $line | ConvertFrom-Json
        $json.content | Out-File 'z:\Kael store\kael final\scratch_wheel.html' -Encoding UTF8
        break
    }
}
