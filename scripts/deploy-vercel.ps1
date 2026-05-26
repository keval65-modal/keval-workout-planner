# Deploy My Fitness Coach to Vercel and link GitHub repo
# Prerequisites: run `vercel login` first

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Checking Vercel auth..."
vercel whoami

Write-Host "Linking project..."
vercel link --yes --project keval-workout-planner

Write-Host "Connecting GitHub repository..."
vercel git connect https://github.com/keval65-modal/keval-workout-planner.git

Write-Host "Deploying to production..."
vercel deploy --prod --yes

Write-Host "Done. Open the production URL shown above."
