UpdateQuizSectionJsonQuestionIds.ps1 will replace any line in the QuizSections.json file that looks like "id": "100" where 100 is any number. 

If QuizSections.json evolves to the point where it contains that same pattern that isn't for just the questions themselves, the powershell script will have unintended behavior.

The Batch script simply runs the powershell file so you don't have to open a command line. 