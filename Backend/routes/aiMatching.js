const express = require('express');
const router = express.Router();

// Mock AI matching algorithm
function calculateCompatibilityScore(user1, user2) {
  let score = 0;
  
  // ความสนใจร่วมกัน (40%)
  const commonInterests = user1.interests.filter(interest => 
    user2.interests.includes(interest)
  ).length;
  const interestScore = (commonInterests / Math.max(user1.interests.length, user2.interests.length)) * 40;
  
  // อายุที่เข้ากัน (20%)
  const ageDiff = Math.abs(user1.age - user2.age);
  const ageScore = Math.max(0, 20 - (ageDiff * 2));
  
  // ระยะทางที่อยู่ (20%)
  const locationScore = user1.location === user2.location ? 20 : 10;
  
  // การยืนยันตัวตน (10%)
  const verificationScore = (user1.verified && user2.verified) ? 10 : 5;
  
  // ค่าสุ่มสำหรับปัจจัยอื่นๆ (10%)
  const randomScore = Math.random() * 10;
  
  score = interestScore + ageScore + locationScore + verificationScore + randomScore;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function generateCompatibilityReasons(score) {
  const reasons = [];
  
  if (score >= 90) {
    reasons.push("บุคลิกเข้ากันอย่างลงตัว", "เป้าหมายชีวิตตรงกัน", "ความสนใจคล้ายกันมาก");
  } else if (score >= 80) {
    reasons.push("ความสนใจร่วมกัน", "ไลฟ์สไตล์เข้ากัน", "วิธีคิดใกล้เคียง");
  } else if (score >= 70) {
    reasons.push("มีความเป็นไปได้ดี", "สามารถเติมเต็มกันได้", "มีจุดร่วมที่น่าสนใจ");
  } else {
    reasons.push("ความแตกต่างที่น่าสนใจ", "โอกาสเรียนรู้ซึ่งกันและกัน", "ความท้าทายที่ดี");
  }
  
  return reasons;
}

// Get AI recommendations for a user
router.post('/recommendations', async (req, res) => {
  try {
    const { userId, userProfile, candidateProfiles } = req.body;
    
    if (!userProfile || !candidateProfiles) {
      return res.status(400).json({ error: 'User profile and candidate profiles are required' });
    }

    // คำนวณคะแนนความเข้ากันได้สำหรับแต่ละ candidate
    const recommendations = candidateProfiles.map(candidate => {
      const matchScore = calculateCompatibilityScore(userProfile, candidate);
      const compatibilityReasons = generateCompatibilityReasons(matchScore);
      
      return {
        ...candidate,
        matchScore,
        compatibilityReasons,
        analysis: {
          commonInterests: userProfile.interests.filter(interest => 
            candidate.interests.includes(interest)
          ),
          ageDifference: Math.abs(userProfile.age - candidate.age),
          sameLocation: userProfile.location === candidate.location
        }
      };
    });

    // เรียงลำดับตามคะแนนจากมากไปน้อย
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      userId,
      recommendations: recommendations.slice(0, 10), // ส่งแค่ 10 อันดับแรก
      analysis: {
        totalCandidates: candidateProfiles.length,
        avgMatchScore: recommendations.reduce((acc, rec) => acc + rec.matchScore, 0) / recommendations.length,
        topMatchScore: recommendations[0]?.matchScore || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get detailed compatibility analysis between two users
router.post('/compatibility', async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    
    if (!user1 || !user2) {
      return res.status(400).json({ error: 'Both user profiles are required' });
    }

    const matchScore = calculateCompatibilityScore(user1, user2);
    const compatibilityReasons = generateCompatibilityReasons(matchScore);
    
    const analysis = {
      overallScore: matchScore,
      compatibilityReasons,
      detailedAnalysis: {
        commonInterests: user1.interests.filter(interest => 
          user2.interests.includes(interest)
        ),
        interestSimilarity: (user1.interests.filter(interest => 
          user2.interests.includes(interest)
        ).length / Math.max(user1.interests.length, user2.interests.length)) * 100,
        ageDifference: Math.abs(user1.age - user2.age),
        locationCompatibility: user1.location === user2.location,
        verificationStatus: user1.verified && user2.verified
      },
      recommendations: {
        meetingStyle: matchScore > 80 ? "casual" : "formal",
        venue: matchScore > 85 ? "intimate" : "public",
        activity: user1.interests.filter(interest => 
          user2.interests.includes(interest)
        )[0] || "coffee"
      }
    };

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
