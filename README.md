### FileTracker_MT_Gdrive

#### Description
  Simple nodejs program that keep track of files in a specified directory,and upload them to a specified gdrive folder
#### Config
Configure your .env file as in .env.example
where:
 * MCD_DIR => Directory where the files you want to backup are.
 * CREDENTIALS_JSON => Credentials from your Service Account
 * GDRIVE_FOLDER => Gdrive folder id,this folder need be shared with your Service Account 
### Run
    node src/index.js

