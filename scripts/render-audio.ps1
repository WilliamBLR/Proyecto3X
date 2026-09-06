$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice = $speaker.GetInstalledVoices() | Where-Object { $_.VoiceInfo.Culture.Name -like 'es-*' } | Select-Object -First 1
if (-not $voice) { throw 'No hay una voz española instalada.' }
$speaker.SelectVoice($voice.VoiceInfo.Name)
$speaker.Rate = -1
$audioRoot = Join-Path $PSScriptRoot '../apps/mobile/assets/audio'
New-Item -ItemType Directory -Force -Path $audioRoot | Out-Null
$chapters = Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot 'narration.json') | ConvertFrom-Json
foreach ($chapter in $chapters) {
  $speaker.SetOutputToWaveFile((Join-Path $audioRoot ($chapter.id + '.wav')))
  $speaker.Speak($chapter.title + '. ' + $chapter.body + ' Recuerda: ' + $chapter.takeaway)
  $speaker.SetOutputToNull()
  Write-Output ($chapter.id + ': narración generada')
}
$speaker.Dispose()
