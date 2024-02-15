type CFProblem = {
    contestId?: number;
    problemsetName?: string;
    index: string;
    name: string;
    type: string;
    points?: number;
    rating?: number;
    tags: string[];
    solvedCount: number;
}

export async function getRandomProblem(lowerRating: number, upperRating: number, tags?: string[]) {
    const url = "https://codeforces.com/api/problemset.problems";
    const response = await fetch(url);
    const data = await response.json();
    let problems = data.result.problems;
    let problemStatistics = data.result.problemStatistics;

    //merge the two arrays together
    for (let i = 0; i < problems.length; i++) {
        problems[i] = {...problems[i], ...problemStatistics[i]};
    }

    //filter out problems matching criteria
    problems.filter((problem: CFProblem) => {
        if (problem.rating === undefined) return false;
        const withinRating = problem.rating >= lowerRating && problem.rating <= upperRating;
        const hasTags = tags ? tags.every(tag => problem.tags.includes(tag)) : false;
        return withinRating && hasTags;
    })

    const randomIndex = Math.floor(Math.random() * problems.length);
    return problems[randomIndex];
}
