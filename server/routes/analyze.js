const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');

// Validation schema for analyze request
const analyzeSchema = z.object({
  images: z.array(z.object({
    data: z.string(), // base64 data
    tag: z.string()
  })).min(1).max(8),
  city: z.string().min(1),
  state: z.string().min(1),
  timeline: z.string().min(1),
  budget: z.string().min(1),
  workPreference: z.string().min(1)
});

// Mock AI analysis for now - returns sample recommendations
const generateMockReport = (data) => {
  const recommendations = [
    {
      room: data.images[0]?.tag || "Living Room",
      priority: "high",
      observation: "Cluttered surfaces and outdated fixtures",
      title: "Declutter and Modernize Living Space",
      action: "Remove personal items, organize furniture, update light fixtures",
      rationale: "Clean, modern spaces appeal to more buyers and photograph better",
      diyCost: "$50-150",
      profCost: "$200-500",
      timeframe: "1-2 days"
    },
    {
      room: data.images[1]?.tag || "Kitchen",
      priority: "medium",
      observation: "Dark cabinets and dated hardware",
      title: "Brighten Kitchen with Simple Updates",
      action: "Replace cabinet hardware, add under-cabinet lighting",
      rationale: "Small kitchen updates can significantly impact perceived value",
      diyCost: "$100-300",
      profCost: "$500-1000",
      timeframe: "Weekend project"
    }
  ];

  return {
    priority: recommendations,
    general: `## Additional Recommendations

Based on your property in ${data.city}, ${data.state}, here are key improvements to maximize value:

### Curb Appeal
- Power wash driveway and walkways
- Touch up exterior paint where needed
- Add colorful planters near entrance

### Interior Staging
- Use neutral colors throughout
- Maximize natural lighting
- Remove excess furniture to create spacious feel

### Timeline Considerations
With your ${data.timeline} timeline, focus on high-impact, quick improvements first.

### Budget Optimization
Your ${data.budget} budget allows for strategic improvements. Prioritize the recommendations above for maximum ROI.`
  };
};

router.post('/api/analyze', async (req, res) => {
  const requestId = req.id;
  
  try {
    // Log the request body for debugging
    console.log(`Analyze request body [${requestId}]:`, JSON.stringify(req.body).slice(0, 200));
    
    // Validate request body
    const validatedData = analyzeSchema.parse(req.body);
    
    // Generate report ID
    const reportId = uuidv4();
    
    // TODO: In production, this would:
    // 1. Save images to storage
    // 2. Call AI service for analysis
    // 3. Store report in database
    // 4. Track costs
    
    // For now, return mock data
    const report = generateMockReport(validatedData);
    
    // Log the analysis request
    console.log(`Analysis requested [${requestId}]:`, {
      reportId,
      city: validatedData.city,
      state: validatedData.state,
      imageCount: validatedData.images.length
    });
    
    // Return report
    res.json({
      reportId,
      report,
      cost: 0.05, // Mock cost
      success: true
    });
    
  } catch (error) {
    console.error(`Analysis failed [${requestId}]:`, error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors,
        requestId
      });
    }
    
    res.status(500).json({
      error: 'Analysis failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      requestId
    });
  }
});

module.exports = router;