**Inputs:**

  1. $N$ qubits in an arbitrary state $|x\rangle$ (input/query register).
  2. A boolean array of length $N$ `pattern` representing a basis state; `true` and `false` elements correspond to $|1\rangle$ and $|0\rangle$, respectively.

**Goal:**
 
Flip the sign of the input state $|x\rangle$ if the input register matches the basis state
represented by `pattern`.  
**Implement this oracle without using auxiliary qubits**

**Examples:**

 * If the query register is in the state $|010\rangle$ and `pattern = [false, true, false]`, flip the sign of the input register.
 * If the query register is in the state $|1001\rangle$ and `pattern = [false, true, true, false]`, do nothing.
  
<br/>
<details>
  <summary><b>Before implementing this oracle, answer the question: are you implementing a marking or a phase oracle?</b></summary>
    This is a phase oracle, because we are changing the phase of the input state $|x\rangle$ based on the value of the function $f(x)$.
</details>

<br/>
<details>
  <summary><b>Need a hint?</b></summary>
  Can you transform the state of the input register based on the <code>pattern</code> value so as to have to flip the phase only for the $|1...1\rangle$ state?
</details>
