import { NextApiRequest, NextApiResponse } from 'next';
import { HttpsProxyAgent } from 'https-proxy-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { playerAddress, score, bossDefeated } = req.body;

        console.log(`Processing tweet request: Player ${playerAddress}, Score ${score}, Boss Defeated: ${bossDefeated}`);

        // Tạo prompt cho AI
        let systemPrompt = "Bạn là một AI hài hước viết tweet từ góc nhìn của boss trong game.";
        let userPrompt = '';

        if (bossDefeated) {
            userPrompt = `Tạo một tweet hài hước từ góc nhìn của một boss trong game vừa bị đánh bại.
      Người chơi có địa chỉ ví là ${playerAddress || 'Unknown'} và đạt được ${score} điểm.
      Tweet nên thể hiện sự thất vọng của boss, nhưng cũng chúc mừng người chơi. Giới hạn 280 ký tự.`;
        } else {
            userPrompt = `Tạo một tweet hài hước từ góc nhìn của một boss trong game, chế nhạo người chơi vừa thua cuộc.
      Người chơi có địa chỉ ví là ${playerAddress || 'Unknown'} và chỉ đạt được ${score} điểm.
      Tweet nên có tính chất trêu chọc, thách thức người chơi quay lại thử lại. Giới hạn 280 ký tự.`;
        }

        console.log('Sending request to Groq API using fetch...');

        // Sử dụng proxy nếu có
        let fetchOptions: any = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY || ''}`,
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: "llama3-8b-8192",
                temperature: 0.7,
                max_tokens: 150,
            }),
            signal: AbortSignal.timeout(30000) // 30 giây timeout
        };

        // Thêm proxy agent nếu có proxy URL
        const proxyUrl = process.env.PROXY_URL;
        if (proxyUrl) {
            const agent = new HttpsProxyAgent(proxyUrl);
            fetchOptions.agent = agent;
        }

        // Gọi API Groq
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', fetchOptions);

        if (!groqResponse.ok) {
            throw new Error(`Groq API error: ${groqResponse.status}`);
        }

        const data = await groqResponse.json();
        const tweetContent = data.choices[0]?.message?.content?.trim() || '';

        console.log('Generated tweet with Groq:', tweetContent);

        // Tạo URL chia sẻ lên Twitter (dự phòng)
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;

        // Thử đăng tweet lên Twitter (cho cả trường hợp boss bị tiêu diệt và không bị tiêu diệt)
        try {
            console.log('Sending tweet to Flask server...');

            // Kiểm tra kết nối đến Flask server
            const healthCheck = await fetch('http://127.0.0.1:5000/health', {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 giây timeout
            }).catch(error => {
                console.error('Flask server health check failed:', error);
                throw new Error('Flask server is not running');
            });

            if (!healthCheck.ok) {
                throw new Error(`Flask server health check failed: ${healthCheck.status}`);
            }

            // Gửi tweet đến Flask server
            const response = await fetch('http://127.0.0.1:5000/post-tweet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tweet_content: tweetContent,
                    boss_defeated: bossDefeated,  // Thêm thông tin boss bị tiêu diệt hay không
                    player_address: playerAddress,
                    score: score
                }),
                signal: AbortSignal.timeout(30000) // Tăng timeout lên 30 giây
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Flask server error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log('Tweet posted successfully via Flask server:', result.tweet_id);

                return res.status(200).json({
                    success: true,
                    tweet: tweetContent,
                    tweetId: result.tweet_id,
                    tweetUrl: result.tweet_url,
                    bossDefeated: bossDefeated
                });
            } else {
                throw new Error(result.error);
            }
        } catch (flaskError) {
            console.error('Error posting to Twitter via Flask server:', flaskError);

            // Trả về nội dung tweet và URL chia sẻ nếu không đăng được
            return res.status(200).json({
                success: false,
                tweet: tweetContent,
                twitterError: flaskError instanceof Error ? flaskError.message : 'Unknown error occurred',
                shareUrl: shareUrl
            });
        }
    } catch (error) {
        console.error('Error in generate-tweet API:', error);

        // Fallback to mock tweets if API fails
        const { playerAddress, score, bossDefeated } = req.body;
        let tweetContent = '';

        if (bossDefeated) {
            const mockTweets = [
                `Không thể tin được! Tôi, Boss vĩ đại, vừa bị đánh bại bởi ${playerAddress || 'Unknown'} với ${score} điểm. Chúc mừng, nhưng lần sau tôi sẽ không dễ dàng vậy đâu! #GameOver #BossDefeated`,
                `Hôm nay là ngày đen tối của tôi! ${playerAddress || 'Unknown'} đã đánh bại tôi với ${score} điểm. Tôi sẽ trở lại mạnh mẽ hơn! #Respect #WillBeBack`,
                `Wow! ${playerAddress || 'Unknown'} thật là một đối thủ đáng gờm! Đánh bại tôi với ${score} điểm. Tôi cần tập luyện thêm rồi! #ImPressed #GoodGame`
            ];
            tweetContent = mockTweets[Math.floor(Math.random() * mockTweets.length)];
        } else {
            const mockTweets = [
                `Haha! ${playerAddress || 'Unknown'} vừa thử thách tôi và thất bại thảm hại với chỉ ${score} điểm. Quay lại khi bạn đã sẵn sàng nhé! #TooEasy #BossFTW`,
                `Một ngày tồi tệ cho ${playerAddress || 'Unknown'}! Chỉ đạt ${score} điểm? Tôi thậm chí còn chưa dùng hết sức đấy! #GetGood #TryAgain`,
                `${playerAddress || 'Unknown'} vừa bị tôi nghiền nát với chỉ ${score} điểm. Có lẽ bạn nên chơi game khác? Hoặc... thử lại và chứng minh tôi sai? #Challenge #ComeBackStronger`
            ];
            tweetContent = mockTweets[Math.floor(Math.random() * mockTweets.length)];
        }

        console.log('Using mock tweet due to API error:', tweetContent);

        // Tạo URL chia sẻ cho mock tweet
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;

        // Trả về mock tweet và URL chia sẻ
        return res.status(200).json({
            success: false,
            tweet: tweetContent,
            twitterError: 'Failed to generate tweet with AI, using mock tweet instead',
            shareUrl: shareUrl
        });
    }
} 