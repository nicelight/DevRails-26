const text = { type: 'string' };
export const replySchema = {
  type: 'object', additionalProperties: false, required: ['feedback', 'subject'], properties: {
    feedback: { type: 'object', additionalProperties: false, required: ['flow', 'message'], properties: {
      flow: { type: 'string', enum: ['continue', 'needs_decision'] }, message: text,
    } },
    subject: { type: 'object', additionalProperties: false, required: ['implementation', 'evidence'], properties: {
      implementation: { type: 'string', enum: ['partial', 'complete'] },
      evidence: { type: 'array', items: text },
    } },
  },
};
