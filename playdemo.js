  document.addEventListener('DOMContentLoaded', async () => {
    // --- UI elements ---
    const selectorContainer = document.getElementById("volumeSelectorContainer");
    const volumeSelect = document.getElementById("volumeSelector");
    const saveVolumeBtn = document.getElementById("saveVolumeBtn");


    // --- Grid & UI variables ---
 
    const grid = document.getElementById('grid');

    const acrossCols = [
      document.getElementById('acrossCol1'),
      document.getElementById('acrossCol2'),
      document.getElementById('acrossCol3')
    ];
    const downCols = [
      document.getElementById('downCol1'),
      document.getElementById('downCol2'),
      document.getElementById('downCol3')
    ];
    const rows = 45;
    const cols = 65;
    const gridMatrix = Array.from({ length: rows }, () => Array(cols).fill(''));
    const blackSquares = Array.from({ length: rows }, () => Array(cols).fill(false));
    const clueNumbersGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
    const wordPositions = [];
    let clueCounter = 1;

    // --- Volume handling ---
    let userVolume = localStorage.getItem("demoVolume") || sessionStorage.getItem("demoVolume");

    if (!userVolume) {
      selectorContainer.style.display = "block";

      saveVolumeBtn.addEventListener("click", async () => {
        const selectedVolume = volumeSelect.value;
        if (!selectedVolume) {
          alert("Please choose a volume");
          return;
        }

        localStorage.setItem("demoVolume", selectedVolume);
        sessionStorage.setItem("demoVolume", selectedVolume);

        selectorContainer.style.display = "none";
        userVolume = selectedVolume;

        await init();
      });

      return; // wait until user selects volume
    }



    function buildEmptyGrid() {
      grid.innerHTML = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.row = r;
          cell.dataset.col = c;
          grid.appendChild(cell);
        }
      }
    }

    function parseCSVLine(line) {
      const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
      return [...line.matchAll(regex)].map(m => m[0].replace(/^"|"$/g, '').trim());
    }

    function savePuzzleState() {
      const puzzleState = {};
      const inputs = document.querySelectorAll('.cell-input');
      inputs.forEach((input, idx) => {
        puzzleState[idx] = input.value.toUpperCase();
      });

      const demoKey = `puzzleState_${userVolume}`;
      const stateJSON = JSON.stringify(puzzleState);
      sessionStorage.setItem(demoKey, stateJSON);
      localStorage.setItem(demoKey, stateJSON);
    }

    function loadPuzzleState() {
      const demoKey = `puzzleState_${userVolume}`;
      let saved = sessionStorage.getItem(demoKey) || localStorage.getItem(demoKey);
      if (!saved) return;
      const puzzleState = JSON.parse(saved);
      const inputs = document.querySelectorAll('.cell-input');
      inputs.forEach((input, idx) => {
        if (puzzleState[idx]) input.value = puzzleState[idx];
      });
    }

    function addInputToCell(cell, r, c) {
      if (blackSquares[r][c]) {
        cell.classList.add('black-square');
        cell.style.backgroundColor = 'black';
        return;
      }

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'cell-input';
      input.autocorrect = 'off';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.style.textTransform = 'uppercase';
      input.style.width = '100%';
      input.style.height = '100%';
      input.style.border = 'none';
      input.style.background = 'transparent';
      input.style.textAlign = 'center';
      input.style.fontSize = '1em';
      input.style.fontWeight = 'bold';
      input.style.color = 'black';
      input.style.outline = 'none';

      input.addEventListener('input', () => {
        checkCorrectness();
        savePuzzleState();
      });

      cell.appendChild(input);
    }

    function blackSquaresFilenameFor(volume) {
      if (volume === 'vol1') return 'demo/crossword_black_squares1.csv';
      if (volume === 'vol2') return 'demo/crossword_black_squares2.csv';
      throw new Error('Unsupported volume: ' + volume);
    }

    function metadataFilenameFor(volume) {
      if (volume === 'vol1') return 'demo/crossword_metadata1.csv';
      if (volume === 'vol2') return 'demo/crossword_metadata2.csv';
      throw new Error('Unsupported volume: ' + volume);
    }

    async function loadBlackSquares() {
      const url = blackSquaresFilenameFor(userVolume);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Black squares file not found: ' + url);
      const text = await response.text();
      const lines = text.trim().split('\n').slice(1);
      for (const line of lines) {
        if (!line) continue;
        const [rStr, cStr] = line.split(',');
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);
        if (Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < rows && c >= 0 && c < cols) {
          blackSquares[r][c] = true;
        }
      }
    }

    async function loadMetadataAndRender() {
      const url = metadataFilenameFor(userVolume);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Metadata file not found: ' + url);
      const text = await response.text();
      const lines = text.trim().split('\n').slice(1);

      for (const line of lines) {
        const parts = parseCSVLine(line);
        if (parts.length < 5) continue;
        const [answerRaw, clueRaw, direction, rStr, cStr] = parts;
        const answer = answerRaw.toUpperCase();
        const clue = clueRaw;
        const r = parseInt(rStr, 10);
        const c = parseInt(cStr, 10);
        const positions = [];

        for (let i = 0; i < answer.length; i++) {
          const row = direction === 'across' ? r : r + i;
          const col = direction === 'across' ? c + i : c;
          if (row >= rows || col >= cols) continue;
          gridMatrix[row][col] = answer[i];
          positions.push([row, col]);
        }

        wordPositions.push({ positions, answer, clue, direction, start: [r, c] });
      }

      wordPositions.forEach(({ start }) => {
        const [r, c] = start;
        if (clueNumbersGrid[r][c] === null) {
          clueNumbersGrid[r][c] = clueCounter++;
        }
      });

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid.children[r * cols + c];
          if (blackSquares[r][c]) {
            cell.classList.add('black-square');
            cell.style.backgroundColor = 'black';
          }

          addInputToCell(cell, r, c);

          if (clueNumbersGrid[r][c] !== null) {
            const clueNumber = document.createElement('div');
            clueNumber.className = 'clue-number';
            clueNumber.textContent = clueNumbersGrid[r][c];
            cell.appendChild(clueNumber);
          }
        }
      }

      buildCluesUI();
    }

    function buildCluesUI() {
      const across = [];
      const down = [];

      wordPositions.forEach(({ answer, clue, direction, start }) => {
        const number = clueNumbersGrid[start[0]][start[1]];
        const clueHTML = `<span class="clue-item" data-answer="${answer}" data-direction="${direction}">${number}. ${clue} <input type="checkbox" class="clue-checkbox" readonly></span>`;

        if (direction === 'across') across.push(clueHTML);
        else down.push(clueHTML);
      });

      const splitIntoThree = (arr) => {
        const third = Math.ceil(arr.length / 3);
        return [arr.slice(0, third), arr.slice(third, 2 * third), arr.slice(2 * third)];
      };

      const [a1, a2, a3] = splitIntoThree(across);
      const [d1, d2, d3] = splitIntoThree(down);

      [a1, a2, a3].forEach((group, i) => acrossCols[i].innerHTML = group.join('<br>'));
      [d1, d2, d3].forEach((group, i) => downCols[i].innerHTML = group.join('<br>'));
    }

    function checkCorrectness() {
      wordPositions.forEach(({ positions, answer, direction }) => {
        const guess = positions.map(([r, c]) => {
          const input = grid.children[r * cols + c].querySelector('input');
          return input?.value.toUpperCase() || ' ';
        }).join('');

        const clueSpan = document.querySelector(`.clue-item[data-answer="${answer}"][data-direction="${direction}"]`);
        if (!clueSpan) return;
        const checkbox = clueSpan.querySelector('input[type="checkbox"]');
        const isCorrect = guess === answer;
        checkbox.checked = isCorrect;
        checkbox.style.accentColor = isCorrect ? 'green' : 'black';
      });
    }


/*     function limitClues(maxClues = 30) {
    const allClues = document.querySelectorAll('.clue-item');
    allClues.forEach((clue, idx) => {
        if (idx >= maxClues) clue.style.display = 'none';
    });

    // Optional: add a “demo limitation” message
    const msg = document.createElement('div');
    msg.style.color = 'gold';
    msg.style.marginTop = '10px';
    msg.style.fontWeight = 'bold';
    msg.textContent = "Demo: only the first 30 clues are visible. Full version unlocks all clues.";
    document.getElementById('acrossCol1').parentElement.appendChild(msg);
}
 */
function limitCluesByRows(maxRow = 5) {
    const allClues = document.querySelectorAll('.clue-item');
    allClues.forEach(clue => {
        // Get starting row from wordPositions
        const answer = clue.dataset.answer;
        const direction = clue.dataset.direction;
        const wordObj = wordPositions.find(w => w.answer === answer && w.direction === direction);
        if (!wordObj) return;

        const startRow = wordObj.start[0];
        if (startRow >= maxRow) {
            clue.style.display = 'none';
        }
    });

    // Optional message
    const msg = document.createElement('div');
    msg.style.color = 'gold';
    msg.style.marginTop = '10px';
    msg.style.fontWeight = 'bold';
    msg.textContent = `  ${maxRow} `;
    document.getElementById('acrossCol1').parentElement.appendChild(msg);
}


    async function init() {
      try {
        buildEmptyGrid();
        await loadBlackSquares();
        await loadMetadataAndRender();
        loadPuzzleState();
        enableSelfMarking();

        // limitClues(30);
limitCluesByRows(5);

      } catch (err) {
        console.error('❌ Failed to initialize:', err);
        alert('Error loading crossword: ' + err.message);
      }
    }

    function enableSelfMarking() {
      const checkboxes = document.querySelectorAll('.clue-checkbox');
      checkboxes.forEach(cb => {
        cb.disabled = false;
        cb.checked = false;
        cb.style.accentColor = 'black';
      });

      checkCorrectness();
    }

    if (userVolume) {
      if (selectorContainer) selectorContainer.style.display = "none";
      init();
    }

  });
