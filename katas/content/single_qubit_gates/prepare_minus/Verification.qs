namespace Kata.Verification {
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Katas;

    operation PrepareMinus(q : Qubit) : Unit is Adj + Ctl {
        X(q);
        H(q);
    }

    operation CheckSolution() : Bool {
        let solution = register => Kata.PrepareMinus(register[0]);
        let reference = register => PrepareMinus(register[0]);
        let isCorrect = CheckOperationsEquivalenceOnZeroStateStrict(solution, reference, 1);

        // Output different feedback to the user depending on whether the exercise was correct.
        if isCorrect {
            Message("Correct!");
        } else {
            Message("Incorrect.");
            Message("Hint: examine the effect your solution has on the |0〉 state and compare it with the effect it " +
                "is expected to have.");
            use target = Qubit[1]; // |0〉
            ShowQuantumStateComparison(target, solution, reference);
            ResetAll(target);
        }
        isCorrect
    }
}
