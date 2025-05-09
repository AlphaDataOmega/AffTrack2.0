const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const questions = [
  {
    name: 'NEXT_PUBLIC_CLOUDFLARE_TOKEN',
    question: 'Enter your Cloudflare API Token: '
  },
  {
    name: 'NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID',
    question: 'Enter your Cloudflare Account ID: '
  },
  {
    name: 'NEXT_PUBLIC_SITE_DOMAIN',
    question: 'Enter your website domain: '
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    question: 'Enter your full website URL (https://yourdomain.com): '
  },
  {
    name: 'POSTGRES_USER',
    question: 'Enter PostgreSQL username: ',
    default: 'postgres'
  },
  {
    name: 'POSTGRES_PASSWORD',
    question: 'Enter PostgreSQL password: '
  },
  {
    name: 'POSTGRES_DB',
    question: 'Enter PostgreSQL database name: '
  },
  {
    name: 'POSTGRES_HOST',
    question: 'Enter PostgreSQL host (default: localhost): ',
    default: 'localhost'
  },
  {
    name: 'POSTGRES_PORT',
    question: 'Enter PostgreSQL port (default: 5432): ',
    default: '5432'
  }
];

async function validateInput(question, answer) {
  if (!answer.trim() && !question.default) {
    throw new Error(`${question} cannot be empty`);
  }
  
  if (question.includes('SITE_URL') && !answer.startsWith('https://')) {
    throw new Error('Site URL must start with https://');
  }

  if (!answer.trim() && question.default) {
    return question.default;
  }
  
  return answer.trim();
}

async function askQuestion(questionObj) {
  return new Promise(async (resolve, reject) => {
    try {
      const answer = await new Promise(resolve => {
        const defaultValue = questionObj.default ? ` (${questionObj.default})` : '';
        rl.question(questionObj.question + defaultValue + ': ', resolve);
      });
      const validatedAnswer = await validateInput(questionObj, answer);
      resolve(validatedAnswer);
    } catch (error) {
      reject(error);
    }
  });
}

async function setup() {
  const envFile = path.join(process.cwd(), '.env');
  let envContent = '';

  console.log('Setting up environment variables...\n');

  try {
    for (const q of questions) {
      const answer = await askQuestion(q);
      envContent += `${q.name}=${answer}\n`;
    }

    const dbUrl = `postgresql://${envContent.match(/POSTGRES_USER=(.+)/)[1]}:${
      envContent.match(/POSTGRES_PASSWORD=(.+)/)[1]
    }@${envContent.match(/POSTGRES_HOST=(.+)/)[1]}:${
      envContent.match(/POSTGRES_PORT=(.+)/)[1]
    }/${envContent.match(/POSTGRES_DB=(.+)/)[1]}`;
    
    envContent += `DATABASE_URL="${dbUrl}"\n`;

    fs.writeFileSync(envFile, envContent);
    console.log('\nEnvironment variables have been set up successfully!');
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup(); 