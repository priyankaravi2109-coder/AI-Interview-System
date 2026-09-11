// AI Interview Question Service
// Temporary local version for development/testing.
// This can be switched to OpenAI later when API credits are available.

const generateInterviewQuestions = async ({
    jobTitle,
    jobDescription,
    skills,
    difficulty,
    technicalCount,
    behavioralCount
}) => {

    const technicalQuestions = [
        {
            question_text: `What are the main technical concepts you would use when working as a ${jobTitle}?`,
            question_type: "technical",
            difficulty: difficulty || "medium",
            topic: "Technical Fundamentals"
        },
        {
            question_text: `Explain how you would approach solving a technical problem related to ${jobTitle}.`,
            question_type: "technical",
            difficulty: difficulty || "medium",
            topic: "Problem Solving"
        },
        {
            question_text: `What are the important best practices you would follow while developing a ${jobTitle} solution?`,
            question_type: "technical",
            difficulty: difficulty || "medium",
            topic: "Best Practices"
        },
        {
            question_text: `How would you test and debug an application developed for this role?`,
            question_type: "technical",
            difficulty: difficulty || "medium",
            topic: "Testing and Debugging"
        },
        {
            question_text: `How would you improve the performance and reliability of a software application?`,
            question_type: "technical",
            difficulty: difficulty || "medium",
            topic: "Performance"
        }
    ];

    const behavioralQuestions = [
        {
            question_text: `Tell me about a challenging technical problem you faced and how you solved it.`,
            question_type: "behavioral",
            difficulty: difficulty || "medium",
            topic: "Problem Solving"
        },
        {
            question_text: `How do you learn a new technology or tool when working on a project?`,
            question_type: "behavioral",
            difficulty: difficulty || "medium",
            topic: "Learning Ability"
        },
        {
            question_text: `Describe a situation where you worked as part of a team to complete a project.`,
            question_type: "behavioral",
            difficulty: difficulty || "medium",
            topic: "Teamwork"
        }
    ];

    const selectedTechnical =
        technicalQuestions.slice(0, technicalCount || 5);

    const selectedBehavioral =
        behavioralQuestions.slice(0, behavioralCount || 3);

    const questions = [
        ...selectedTechnical,
        ...selectedBehavioral
    ].map((question, index) => ({
        ...question,
        sequence_number: index + 1
    }));

    return {
        questions
    };
};

module.exports = {
    generateInterviewQuestions
};