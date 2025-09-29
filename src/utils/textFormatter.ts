import DOMPurify from 'dompurify';

// Rich text formatting utility for chat messages
export const formatChatMessage = (content: string): string => {
  // First, sanitize any HTML to prevent XSS
  let formatted = DOMPurify.sanitize(content, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });

  // Convert markdown-style formatting to HTML
  
  // Bold text: **text** or __text__
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Italic text: *text* or _text_
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Code blocks: ```code```
  formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Inline code: `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Line breaks: convert \n to <br>
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Lists: Convert lines starting with - or * to unordered lists
  const lines = formatted.split('<br>');
  let inList = false;
  let processedLines: string[] = [];
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else if (trimmed.match(/^\d+\.\s/)) {
      // Numbered lists
      if (!inList) {
        processedLines.push('<ol>');
        inList = true;
      }
      processedLines.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
    } else {
      if (inList) {
        const lastList = processedLines[processedLines.length - 1];
        if (lastList && (lastList.includes('<ul>') || lastList.includes('<ol>'))) {
          processedLines.push(lastList.includes('<ul>') ? '</ul>' : '</ol>');
        }
        inList = false;
      }
      if (trimmed) {
        processedLines.push(line);
      }
    }
  });
  
  // Close any open lists
  if (inList) {
    const lastList = processedLines[processedLines.length - 1];
    if (lastList && (lastList.includes('<ul>') || lastList.includes('<ol>'))) {
      processedLines.push(lastList.includes('<ul>') ? '</ul>' : '</ol>');
    }
  }
  
  formatted = processedLines.join('');
  
  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
  formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
  
  // Sanitize the final HTML output while allowing our safe tags
  return DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ['strong', 'em', 'code', 'pre', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });
};

// Generate a session title from the first user message
export const generateSessionTitle = (message: string): string => {
  // Remove formatting and get first 50 characters
  const cleaned = message.replace(/[*_`#\n]/g, '').trim();
  if (cleaned.length <= 50) return cleaned;
  
  // Find the last complete word within 50 characters
  const truncated = cleaned.substring(0, 50);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 20) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};