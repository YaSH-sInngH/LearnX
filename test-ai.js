// Test script to set module notes and test AI
const testNotes = `# Invention of Zero

- Zero (0) is both a number and a numerical digit used to represent the absence of any quantity.
- It plays a crucial role in the modern number system as a placeholder and in arithmetic operations.

## Historical Development

- Ancient Civilizations like the Babylonians used placeholders (around 300 BCE) in their positional number system but lacked a true zero.
- Maya Civilization (in Central America) independently developed a symbol for zero by around 4th century CE for use in their calendar system.

## Zero in Indian Mathematics

- The first true use of zero as both a placeholder and a number was in India.
- Mathematician Brahmagupta (628 CE) is credited with formalizing zero in his work Brahmasphutasiddhanta.
- He defined operations involving zero, including rules like:
- \\( a + 0 = a \\)
- \\( a - 0 = a \\)
- \\( a \\times 0 = 0 \\)
- Division by zero was mentioned, but misunderstood (as infinity or undefined).

## Transmission to the West

- Indian mathematics and the concept of zero spread to the Islamic world through scholars and translations (like Al-Khwarizmi).
- From there, it entered Europe around the 12th century via Latin translations of Arabic texts.

## Significance of Zero

- Enabled the development of the decimal (base-10) positional number system.
- Crucial for advancements in mathematics, science, engineering, and computer science.
- Forms the foundation of binary code (0 and 1) used in digital computing.

## Summary

- Zero's invention is one of the greatest intellectual achievements in mathematics.
- It transformed arithmetic and laid the groundwork for modern technological progress.`;

console.log('Test notes prepared:', testNotes.length, 'characters');

// Instructions for testing:
console.log('\n📋 To test the AI with these notes:');
console.log('1. Start your backend server');
console.log('2. Use this endpoint to set notes: POST /api/ai/test/set-notes/{moduleId}');
console.log('3. Body: { "notes": "..." } (copy the testNotes above)');
console.log('4. Then ask questions like:');
console.log('   - "Who invented zero?"');
console.log('   - "Tell me about Maya Civilization"');
console.log('   - "What is this module about?"');
console.log('5. Check the backend console for debugging output'); 