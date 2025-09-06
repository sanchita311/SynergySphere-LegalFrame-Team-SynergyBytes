import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load constitution data
let constitutionData = null;

const loadConstitutionData = () => {
    try {
        const dataPath = path.join(__dirname, '../data/constitution.json');
        const data = fs.readFileSync(dataPath, 'utf8');
        constitutionData = JSON.parse(data);
        console.log('Constitution data loaded successfully');
    } catch (error) {
        console.error('Error loading constitution data:', error);
        constitutionData = [];
    }
};

// Load data on startup
loadConstitutionData();

// GET AI clause recommender page
router.get('/ai-clause-recommender', (req, res) => {
    res.render('ai/clause-recommender', {
        title: 'AI Legal Clause Recommender',
        user: req.session.user
    });
});

// POST API endpoint for clause suggestions
router.post('/api/suggest-clauses', (req, res) => {
    try {
        const { caseDescription } = req.body;
        
        if (!caseDescription || caseDescription.trim() === '') {
            return res.status(400).json({ 
                error: 'Case description is required' 
            });
        }

        if (!constitutionData || constitutionData.length === 0) {
            return res.status(500).json({ 
                error: 'Constitution data not available' 
            });
        }

        const suggestions = suggestClauses(caseDescription);
        
        res.json({
            success: true,
            suggestions: suggestions,
            totalFound: suggestions.length
        });

    } catch (error) {
        console.error('Error in clause suggestion:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// Function to suggest clauses based on case description
function suggestClauses(caseDescription) {
    const suggestions = [];
    const caseText = caseDescription.toLowerCase();

    constitutionData.forEach(clause => {
        // Check if any keyword matches
        const hasKeywordMatch = clause.keywords && clause.keywords.some(keyword => 
            caseText.includes(keyword.toLowerCase())
        );

        // Check if title or description contains relevant terms
        const hasTitleMatch = clause.title && 
            caseText.includes(clause.title.toLowerCase());
        
        const hasDescriptionMatch = clause.description && 
            caseText.includes(clause.description.toLowerCase());

        if (hasKeywordMatch || hasTitleMatch || hasDescriptionMatch) {
            suggestions.push({
                article: clause.article,
                title: clause.title,
                description: clause.description,
                keywords: clause.keywords,
                relevance: calculateRelevance(caseText, clause)
            });
        }
    });

    // Sort by relevance score
    return suggestions.sort((a, b) => b.relevance - a.relevance);
}

// Calculate relevance score
function calculateRelevance(caseText, clause) {
    let score = 0;
    
    // Keyword matches
    if (clause.keywords) {
        clause.keywords.forEach(keyword => {
            if (caseText.includes(keyword.toLowerCase())) {
                score += 2;
            }
        });
    }
    
    // Title match
    if (clause.title && caseText.includes(clause.title.toLowerCase())) {
        score += 3;
    }
    
    // Description match
    if (clause.description && caseText.includes(clause.description.toLowerCase())) {
        score += 1;
    }
    
    return score;
}

export default router;
