"use strict";
document.body.style.display = 'grid';
document.body.style.placeItems = 'center';
document.body.style.height = '100vh';
document.body.style.margin = '0px';
document.body.style.padding = '3vh';
const radio = (text) => {
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.gap = '.5ch';
    label.style.cursor = 'pointer';
    label.style.padding = '8px';
    label.style.borderRadius = '3px';
    label.onmouseenter = () => label.style.backgroundColor = '#eee';
    label.onmouseleave = () => label.style.backgroundColor = '';
    const input = document.createElement('input');
    input.required = true;
    input.name = 'x';
    input.type = 'radio';
    input.style.margin = '0px';
    input.style.cursor = 'pointer';
    const span = document.createElement('span');
    span.textContent = text;
    label.append(input, span);
    return {
        label,
        input,
        clear() {
            label.style.cursor = '';
            input.style.cursor = '';
            label.onmouseenter = null;
            label.onmouseleave = null;
        }
    };
};
const page = (question) => {
    const isResult = typeof question.result === 'number';
    const form = document.createElement('form');
    form.style.display = 'grid';
    form.style.rowGap = '10px';
    form.style.justifyContent = 'center';
    const fieldset = document.createElement('fieldset');
    fieldset.style.display = 'grid';
    fieldset.style.rowGap = '10px';
    fieldset.style.border = '1px solid #ccc';
    fieldset.style.padding = '20px';
    fieldset.disabled = isResult;
    const radios = question.options.map(text => radio(text));
    const questionDiv = document.createElement('div');
    questionDiv.textContent = question.questionText;
    questionDiv.style.width = 'fit-content';
    questionDiv.style.placeSelf = 'center';
    questionDiv.style.fontWeight = 'bold';
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'I think I am right';
    submitButton.style.marginTop = '20px';
    const showAsResult = (selectedRadio, correctRadio) => {
        for (const item of radios)
            item.clear();
        fieldset.disabled = true;
        correctRadio.label.style.outline = '1px solid green';
        if (selectedRadio !== correctRadio)
            selectedRadio.label.style.outline = '1px solid red';
        submitButton.remove();
    };
    form.append(questionDiv, fieldset);
    fieldset.append(...radios.map(r => r.label));
    if (isResult) {
        const selectedRadio = radios[question.result];
        const correctRadio = radios[question.correctIndex];
        showAsResult(selectedRadio, correctRadio);
    }
    else {
        form.append(submitButton);
    }
    const resolveSubmission = new Promise(resolve => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const correctRadio = radios[question.correctIndex];
            const selectedRadio = radios.find(radio => radio.input.checked);
            if (!selectedRadio)
                return;
            showAsResult(selectedRadio, correctRadio);
            question.result = radios.findIndex(radio => radio === selectedRadio);
            resolve(selectedRadio === correctRadio);
        });
    });
    return {
        element: form,
        resolveSubmission,
        isResult
    };
};
const game = (questions) => {
    const pages = questions.map(question => page(question));
    let currentPage = 0;
    let score = 0;
    const main = document.createElement('main');
    main.style.display = 'grid';
    main.style.gridTemplateRows = '50px 50px min-content 50px';
    main.style.gap = '5px;';
    main.style.width = '400px';
    main.style.height = 'fit-content';
    const formDiv = document.createElement('div');
    formDiv.style.margin = '30px 30px 0px 30px';
    const topDiv = document.createElement('div');
    topDiv.style.width = 'fit-content';
    topDiv.style.placeSelf = 'center';
    const scoreDiv = document.createElement('div');
    scoreDiv.style.width = 'fit-content';
    scoreDiv.style.placeSelf = 'end';
    scoreDiv.textContent = 'Score: 0';
    const buttonDiv = document.createElement('div');
    buttonDiv.style.display = 'flex';
    buttonDiv.style.justifyContent = 'space-between';
    buttonDiv.style.alignItems = 'center';
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.addEventListener('click', () => {
        if (currentPage === questions.length - 1) {
            showUrl(createUrl(questions), main);
            return;
        }
        currentPage++;
        render();
    });
    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.type = 'button';
    backButton.addEventListener('click', () => {
        if (currentPage === 0)
            return;
        currentPage--;
        render();
    });
    buttonDiv.append(backButton, nextButton);
    const render = () => {
        const page = pages[currentPage];
        formDiv.replaceChildren(page.element ?? 'Error. Fix this.');
        backButton.style.visibility = currentPage === 0 ? 'hidden' : '';
        nextButton.style.visibility = 'hidden';
        page.resolveSubmission.then(isCorrect => {
            nextButton.style.visibility = '';
            nextButton.textContent = currentPage === questions.length - 1 ? 'Share Results' : 'Next';
            if (!page.isResult && isCorrect)
                score++;
            page.isResult = true;
            scoreDiv.textContent = `Score: ${score}`;
        });
        topDiv.textContent = `Question ${currentPage + 1} of ${questions.length}`;
    };
    render();
    main.append(scoreDiv, topDiv, formDiv, buttonDiv);
    return main;
};
const answerInput = (deleteSelf, radioName) => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '5px';
    const input = document.createElement('input');
    input.type = 'text';
    input.required = true;
    input.pattern = '.*\\S.*';
    input.maxLength = 40;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.required = true;
    radio.name = radioName;
    radio.style.margin = '0px';
    radio.title = 'Correct answer';
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'x';
    deleteButton.title = 'Delete answer';
    deleteButton.addEventListener('click', () => deleteSelf(obj));
    deleteButton.style.visibility = 'hidden';
    div.append(radio, input, deleteButton);
    const obj = {
        div,
        deleteButton,
        get value() {
            return input.value;
        },
        get isCorrect() {
            return radio.checked;
        },
    };
    return obj;
};
const questionForm = (deleteSelf, updateButtonVisibility) => {
    const form = document.createElement('form');
    form.style.border = '1px solid #ccc';
    form.style.padding = '15px';
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        fieldset.disabled = true;
        updateButtonVisibility(false, obj);
        buttonDiv.replaceChildren(editButton);
    });
    const fieldset = document.createElement('fieldset');
    fieldset.style.display = 'grid';
    fieldset.style.gap = '8px';
    fieldset.style.border = '0px';
    const questionTextInput = document.createElement('input');
    questionTextInput.placeholder = 'Enter a question';
    questionTextInput.type = 'text';
    questionTextInput.required = true;
    questionTextInput.pattern = '.*\\S.*';
    questionTextInput.maxLength = 60;
    const answerRadioName = crypto.randomUUID();
    const answerInputs = [];
    const addAnswer = () => {
        if (answerInputs.length >= 4)
            return;
        const input = answerInput(() => removeAnswer(input), answerRadioName);
        if (answerInputs.length)
            answerInputs[answerInputs.length - 1].div.after(input.div);
        else
            questionTextInput.after(input.div);
        answerInputs.push(input);
        updateDeleteButtons();
        addAnswerButton.style.visibility = answerInputs.length >= 4 ? 'hidden' : '';
    };
    const removeAnswer = (input) => {
        if (answerInputs.length <= 2)
            return;
        input.div.remove();
        answerInputs.splice(answerInputs.indexOf(input), 1);
        updateDeleteButtons();
        addAnswerButton.style.visibility = answerInputs.length >= 4 ? 'hidden' : '';
    };
    const updateDeleteButtons = () => {
        for (const input of answerInputs) {
            input.deleteButton.style.visibility = answerInputs.length > 2 ? 'visible' : 'hidden';
        }
    };
    const buttonDiv = document.createElement('div');
    buttonDiv.style.display = 'flex';
    const deleteQuestionButton = document.createElement('button');
    deleteQuestionButton.type = 'button';
    deleteQuestionButton.textContent = 'Delete Question';
    deleteQuestionButton.addEventListener('click', () => {
        deleteSelf(obj);
        updateButtonVisibility(false, obj);
    });
    const addAnswerButton = document.createElement('button');
    addAnswerButton.type = 'button';
    addAnswerButton.textContent = 'Add answer';
    addAnswerButton.addEventListener('click', addAnswer);
    const okButton = document.createElement('button');
    okButton.type = 'submit';
    okButton.textContent = 'OK';
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
        fieldset.disabled = false;
        buttonDiv.replaceChildren(deleteQuestionButton, addAnswerButton, okButton);
        updateButtonVisibility(true, obj);
    });
    fieldset.append(questionTextInput);
    addAnswer();
    addAnswer();
    buttonDiv.append(deleteQuestionButton, addAnswerButton, okButton);
    form.append(fieldset, buttonDiv);
    const obj = {
        form,
        buttonDiv,
        deleteQuestionButton,
        get value() {
            return {
                questionText: questionTextInput.value.trim(),
                options: answerInputs.map(input => input.value.trim()),
                correctIndex: answerInputs.findIndex(input => input.isCorrect),
            };
        }
    };
    updateButtonVisibility(true, obj);
    return obj;
};
const setup = () => {
    const main = document.createElement('main');
    main.style.padding = '10px';
    main.style.display = 'grid';
    main.style.gap = '30px';
    const questionForms = [];
    const addQuestion = () => {
        if (questionForms.length >= 10)
            return;
        const q = questionForm(removeQuestion, updateButtonVisibility);
        if (questionForms.length)
            questionForms[questionForms.length - 1].form.after(q.form);
        else
            main.prepend(q.form);
        questionForms.push(q);
    };
    const removeQuestion = (q) => {
        q.form.remove();
        questionForms.splice(questionForms.indexOf(q), 1);
        addQuestionButton.disabled = questionForms.length >= 10;
    };
    const addQuestionButton = document.createElement('button');
    addQuestionButton.type = 'button';
    addQuestionButton.textContent = 'Add a question';
    addQuestionButton.addEventListener('click', addQuestion);
    const saveQuizButton = document.createElement('button');
    saveQuizButton.type = 'button';
    saveQuizButton.textContent = 'Save Quiz';
    saveQuizButton.style.visibility = 'hidden';
    saveQuizButton.addEventListener('click', () => {
        const questions = questionForms.map(q => q.value);
        showUrl(createUrl(questions), main);
    });
    const buttonDiv = document.createElement('div');
    buttonDiv.style.display = 'flex';
    buttonDiv.append(addQuestionButton, saveQuizButton);
    const updateButtonVisibility = (isEditing, current) => {
        addQuestionButton.disabled = questionForms.length >= 10;
        buttonDiv.style.display = isEditing ? 'none' : 'flex';
        for (const form of questionForms.filter(f => f !== current))
            form.buttonDiv.style.visibility = isEditing ? 'hidden' : '';
        saveQuizButton.style.visibility = questionForms.length ? 'visible' : 'hidden';
    };
    main.append(buttonDiv);
    return main;
};
const showUrl = (url, main) => {
    const pre = document.createElement('pre');
    const a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    pre.append(a);
    pre.style.width = '500px';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordBreak = 'break-word';
    main.replaceChildren(pre);
};
const getResults = (questions) => {
    const pages = questions.map(q => page(q)).map(p => p.element);
    for (const page of pages) {
        page.style.boxShadow = '0px 0px 3px 1px #eee';
        page.style.padding = '30px';
    }
    const main = document.createElement('main');
    main.style.display = 'grid';
    main.style.gridTemplateColumns = '1fr 1fr 1fr';
    main.style.gap = '40px';
    main.append(...pages);
    return main;
};
const createUrl = (questions) => {
    const url = new URL('/quiz/index.html', window.location.origin);
    url.search = `?${convertQuestionsToBase64(questions)}`;
    return url.toString();
};
const convertQuestionsToBase64 = (questions) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(questions))));
const getQuestionsFromBase64 = (str) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(str), c => c.charCodeAt(0))));
const startGame = (questions) => document.body.replaceChildren(game(questions));
const startSetup = () => document.body.replaceChildren(setup());
const showResults = (questions) => document.body.replaceChildren(getResults(questions));
const base64String = window.location.search.slice(1);
if (base64String) {
    try {
        const questions = getQuestionsFromBase64(base64String);
        if (typeof questions[0].result === 'number') {
            showResults(questions);
            console.log(questions);
        }
        else {
            startGame(questions);
        }
    }
    catch {
        startSetup();
    }
}
else {
    startSetup();
}
