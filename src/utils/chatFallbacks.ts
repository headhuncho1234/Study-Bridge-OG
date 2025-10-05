// Fallback responses for when AI is unavailable or times out
export const getFallbackResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Keyword-based fallback responses
  if (message.includes('scholarship') || message.includes('financial aid')) {
    return "I'm currently having trouble connecting, but here's what I can tell you: You can explore scholarships in our Scholarship Database. Visit the 'Scholarships' section to filter by eligibility, amount, and deadline. Many scholarships are available for international students based on merit, need, or specific demographics.";
  }
  
  if (message.includes('visa') || message.includes('immigration')) {
    return "I'm currently having trouble connecting, but here's what I can tell you: For visa guidance, check our Visa Guidance section where we provide step-by-step information for F-1 student visas, required documents, and timelines. Each country has specific requirements, so make sure to check with your university's international office as well.";
  }
  
  if (message.includes('housing') || message.includes('accommodation') || message.includes('roommate')) {
    return "I'm currently having trouble connecting, but here's what I can tell you: Our Housing Solutions section can help you find on-campus and off-campus housing options. You can also use our roommate matching feature to find compatible roommates based on your preferences and lifestyle.";
  }
  
  if (message.includes('university') || message.includes('college') || message.includes('school') || message.includes('application')) {
    return "I'm currently having trouble connecting, but here's what I can tell you: Use our Smart Matching tool to find universities that match your profile based on your GPA, budget, preferred location, and program interests. The questionnaire takes just a few minutes and provides personalized recommendations.";
  }
  
  if (message.includes('wellness') || message.includes('health') || message.includes('mental health') || message.includes('support')) {
    return "I'm currently having trouble connecting, but here's what I can tell you: Our Wellness & Support section offers resources for mental health, health insurance guidance, and stress management tools. You can also play wellness games to earn coins and track your wellbeing journey.";
  }
  
  // Default fallback for any other query
  return "I'm currently having trouble connecting to provide a personalized response. However, StudyBridge offers comprehensive tools to help you: Smart Matching for university recommendations, Scholarship Database for funding opportunities, Visa Guidance for immigration help, Housing Solutions for accommodation, and Wellness Support for your wellbeing. Please explore these sections or try asking your question again in a moment.";
};

export const getTimeoutMessage = (userMessage: string): string => {
  return `I'm taking longer than expected to respond. Here's a quick answer: ${getFallbackResponse(userMessage)} \n\nFeel free to try asking your question again for a more detailed response.`;
};

export const getEmptyInputMessage = (): string => {
  return "Could you please tell me what you'd like to know? I can help with university applications, scholarships, visas, housing, wellness support, and much more!";
};
