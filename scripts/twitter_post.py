import tweepy
import sys
import json
import logging
from flask import Flask, request, jsonify
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Cấu hình logging
log_dir = os.path.join(os.path.dirname(__file__), 'logs')
os.makedirs(log_dir, exist_ok=True)
logging.basicConfig(
    filename=os.path.join(log_dir, f'twitter_server_{datetime.now().strftime("%Y%m%d")}.log'),
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Twitter API credentials from environment variables
BEARER_TOKEN = os.environ.get("TWITTER_BEARER_TOKEN")
CONSUMER_KEY = os.environ.get("TWITTER_CONSUMER_KEY")
CONSUMER_SECRET = os.environ.get("TWITTER_CONSUMER_SECRET")
ACCESS_TOKEN = os.environ.get("TWITTER_ACCESS_TOKEN")
ACCESS_TOKEN_SECRET = os.environ.get("TWITTER_ACCESS_TOKEN_SECRET")

# Validate credentials are available
if not all([BEARER_TOKEN, CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET]):
    logging.error("Missing Twitter API credentials in environment variables")
    print("Error: Missing Twitter API credentials. Please set them in .env file")
    sys.exit(1)

app = Flask(__name__)

@app.route('/post-tweet', methods=['POST'])
def post_tweet():
    data = request.json
    tweet_content = data.get('tweet_content')
    
    if not tweet_content:
        logging.error("No tweet content provided")
        return jsonify({
            'success': False,
            'error': 'No tweet content provided'
        }), 400
    
    logging.info(f"Received request to post tweet: {tweet_content[:50]}...")
    
    try:
        # Kết nối API v2
        client_v2 = tweepy.Client(
            bearer_token=BEARER_TOKEN,
            consumer_key=CONSUMER_KEY,
            consumer_secret=CONSUMER_SECRET,
            access_token=ACCESS_TOKEN,
            access_token_secret=ACCESS_TOKEN_SECRET,
            wait_on_rate_limit=True
        )
        
        # Đăng tweet
        response = client_v2.create_tweet(text=tweet_content)
        tweet_id = response.data['id']
        
        logging.info(f"Tweet posted successfully with ID: {tweet_id}")
        
        return jsonify({
            'success': True,
            'tweet_id': tweet_id,
            'tweet_url': f"https://twitter.com/user/status/{tweet_id}"
        })
    
    except Exception as e:
        logging.error(f"Error posting tweet: {str(e)}")
        
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'message': 'Twitter server is running'
    })

if __name__ == '__main__':
    logging.info("Starting Twitter Flask server on port 5000")
    app.run(host='0.0.0.0', port=5000)