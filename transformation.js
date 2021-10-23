let index = 0;
let prefixURL, 
    suffixURL, currentSuffix,
    firstStepOriginal, firstStepChanged, currentFirst,
    currentStep,
    changesApplied = [], changesMade = [],
    error, 
    
    // consider DELETE
    isChangesApplied = false, isChangesMade = false;

/**
 * Step {
 *      stepStr:            [String], // length is either 1 or 2 (layer start,end)
 *      ancestor:           Step,
 *      next:               Step,
 *      prev:               Step,
 *      siblingStep:        Step, // matching step in changed/original list
 *      element:            HTML element,
 *      isOriginalSteps:    Boolean
 * }
 */

 /**
  *  TODO:
  * 
  * make it a standalone app
  * 
  * add - UI/option to add steps + listen to "/", newline key
  * 
  * add - show curr image details - dimensions, ?
  * fix - derive elem type from URL ('image/upload' can be also a video, and 'video/upload' can be also an image)
  * add - "undo" "redo"
  * add - option to enable/disable specific steps
  * add - allow changing of the URL prefix (host, delivery/resource? type, SEO)
  * add - support SEOs/CNAMES
  * add - loading gif ?
  * add - line/step numbers (CSS/HTML) + specify line number in error?
  * 
  * add - tips! e.g - uneven # of layers/apply
  * add - support signed URLs ???
  * add - tooltips describing transformation parameters (with a link to the relevant docs?)
  * 
  * add a diff between original transformation and changed transformation (strikethrough) - deleted modified added.
  * 
  * text handler - creatElem is called twice (inside copyStep and explicitly)
  * 
  * 
  */
 
const urlParams = new URLSearchParams(window.location.search);
const standAlone = urlParams.get('sa');
if (standAlone === 'false') {
    const windowId = parseInt(urlParams.get('window')); // origin window
    chrome.tabs.query({windowId}, function(tabs) { // handshake
        chrome.tabs.sendMessage(tabs[0].id, {greeting: 'hello'}, response => init(response.url));
    });
}
else {
    console.log('stand alone');
}

function init(url) {

    const parsedURL = parseCloudinaryURL(url);
    const trStrings = parsedURL.transformationStr;
    const layerMap = createLayerMap(parsedURL.transformation);

    // initiate global params
    // firstStepOriginal = generateSteps(response.steps);

    firstStepOriginal = generateSteps(layerMap, trStrings);
    firstStepChanged = copyStepsList(firstStepOriginal);
    currentFirst = firstStepOriginal;
    currentStep = firstStepOriginal;
    
    prefixURL = parsedURL.url.slice(0, parsedURL.url.indexOf(trStrings[0])-1);
    let urlArray = parsedURL.url.split('/');
    suffixURL = urlArray.slice(urlArray.indexOf(trStrings[0]) + trStrings.length).join('/');

    currentSuffix = suffixURL;

    // init the transformation breakdown text editor
    document.getElementById("urlPrefix").innerText = prefixURL;
    document.getElementById("urlSuffix").innerText = suffixURL;
    document.getElementById("urlSuffix").contentEditable = true;
    document.getElementById("urlSuffix").spellcheck = false;
    document.getElementById("urlSuffix").oninput = e => suffixHandler(e.target.innerText);

    // init actions of actionsPane
    document.getElementById("reset").onclick = reset;
    document.getElementById("reset").disabled = true;
    document.getElementById("apply").onclick = applyChanges;
    document.getElementById("apply").disabled = true;
    document.getElementById("copyURL").onclick = copyURL;
    document.getElementById("jumpToEnd").onclick = jumpToEnd;
    document.getElementById("jumpToStart").onclick = jumpToStart;

    const initialURL = generateURL(currentFirst);

    // create and configure preview element
    const elem = parsedURL.resource_type === "video" ? "video" : "img";
    let elemType = elem;
    const previewElem = document.createElement(elemType);
    previewElem.src = initialURL;
    previewElem.id = "preview";
    previewElem.onerror = () => console.log(error); 

    if (elemType === "video") previewElem.controls = true;
    document.getElementById("previewWall").appendChild(previewElem);

    // configure URL and navigator elements
    document.getElementById("URL").innerText = initialURL;
    document.getElementById("prev").onclick = prev;
    document.getElementById("next").onclick = next;
    toggleNav(currentFirst);

    // Listening for x-cld-error header
    chrome.webRequest.onHeadersReceived.addListener(
        function(details) {
            // console.log(details.responseHeaders);
            let ei = details.responseHeaders.find((h) => h.name === "x-cld-error");
            if (ei) {
                error = ei.value;
                document.getElementById("error").innerText = ei.value;
                previewElem.onload = () => previewElem.parentNode.classList.remove("skeleton");
            }
            else {
                error = '';
                document.getElementById("error").innerText = '';
            }
            return {responseHeaders: details.responseHeaders};
        },
        // filters
        {urls: ['*://*.cloudinary.com/*']},
        // extraInfoSpec
        ['responseHeaders'] //, 'extraHeaders']);
    );

    // configure "loading" gesture
    observer = new MutationObserver((changes) => {
        changes.forEach(change => {
            if(change.attributeName.includes('src')){
                previewElem.parentNode.classList.add("skeleton");
            }
        });
    });
    observer.observe(previewElem, {attributes : true});
    previewElem.onload = () => previewElem.parentNode.classList.remove("skeleton");

    function generateSteps(layerMap, trStrings) {
        const oldSteps = stringifySteps(layerMap, trStrings)
    
        let i = 0;
        let currStep;
        let firstStep = { 
            stepStr:            oldSteps[i].stepStr,
            ancestor:           undefined,
            next:               undefined,
            prev:               undefined,
            siblingStep:        undefined,
            isOriginalSteps:    true
        }
        firstStep.element = createElem(firstStep, "step" + i);
        i++;
        currStep = firstStep;
        for (; i < oldSteps.length; i++) {
            let newStep = {
                stepStr:            oldSteps[i].stepStr,
                ancestor:           oldSteps[i].ancestor ? oldSteps[oldSteps[i].ancestor].newStep : undefined,
                next:               undefined,
                prev:               currStep,
                siblingStep:        undefined,
                isOriginalSteps:    true
            }
            newStep.element = createElem(newStep, "step" + i);
            oldSteps[i].newStep = newStep;
            currStep.next = newStep;
            currStep = newStep;
        }
        return firstStep;
    }
    
    function stringifySteps(layerMap, trStrings) {
        function isLayerApply(j, map) {
            let res = false;
            map.forEach((layer) => {if (layer.end === j && layer.start !== j) res = true}); 
            // map.forEach((layer) => {if (layer.end == j) res = true}); // && layer.start != j
            return res;
        }
        function generateExploadSteps(trStrings, layersMap, i, k) {  // generates a single URL steps
            let ancestor;
            
            var relevantIndices = [];
            relevantIndices.push(i);
            for (var j=0; j<=i; j++) {
                // relevantIndices.push(j);
                layersMap.forEach((layer, layerIndex) => {
                    if (j >= layer.start && layer.end >= i) {
                        if (j === layer.start && j!=i) {
                            ancestor = layer.step;//j-1;
                        }
                        // relevantIndices.push(j);
                        // relevantIndices.push(layer.end);
                    }
                    if (i === layer.start) {
                        layer.step = k;
                        relevantIndices.push(layer.end);
                    }
                })
            }
            relevantIndices = [...new Set(relevantIndices)]; // removes duplicates
            relevantIndices.sort((a, b) => a - b);
            var t = {
                ancestor,
                stepStr: relevantIndices.map((i) => trStrings[i]),//.join('/'),
            }
            // console.log("rel", i+1, relevantIndices.map((i) => i+1), t);
            return t;
        }
        
        const steps = [];
        steps.push({
            stepStr:['']
        });
    
        for (var j=0, k=1; j<=trStrings.length - 1; j++) {
            if (isLayerApply(j,layerMap)) continue;
            steps.push(generateExploadSteps(trStrings, layerMap, j, k)); // index:j, step
            k++;
        }
    
        console.log("expload",{layerMap, steps});
        
        return steps;
    }

    function createLayerMap(tr) {
        // general logic referenced from renderHTML method of viewDetails.js
        // gets output of parseCloudinaryURL(url)
        
        const transformation = tr;
        console.log(transformation);
        let layerDepth = 0;
        const layerMap = [];
    
        for( let i=0; i<transformation.length; i++ ) {
            for( let j=0; j<transformation[i].length; j++ ) {
                // If statement
                if( transformation[i][j].name === 'If' ) {
                }
    
                // Flags Layer Apply
                else if( transformation[i][j].name === 'Flags' && transformation[i][j].value.indexOf('layer_apply') >= 0 ) {
                    fl_layer_apply:
                    for( var k=i; k>=0; k-- ) {
                        for( var l=0; l<transformation[k].length; l++ ) {
                            if( ['Overlay','Underlay'].indexOf(transformation[k][l].name) >= 0 ) {
                                if( --layerDepth === 0 || k === i) { // added || k === i 
                                    break fl_layer_apply;
                                }
                            }
                            else if( transformation[k][l].name === 'Flags' && transformation[k][l].value.indexOf('layer_apply') >= 0 ) {
                                layerDepth++;
                                break;
                            }
                        }
                    }
                    // if k = -1 then either l_layer,fl_layer_apply (k = i) OR no layer apply present 
                    layerMap.push({end: i, start: k});
                }
            }
        }
        console.log("layerMap", layerMap);
        return layerMap;
    }
}

function copyStepsList(from, to) {
    let firstNew, currNew, currOld;
    currOld = from;
    firstNew = copyStep(from, false);
    firstNew.prev = from.prev ? from.prev.siblingStep : undefined;
    from.siblingStep = firstNew;
    currNew = firstNew;
    currOld = currOld.next;
    while (currOld !== to) {
        currNew.next = copyStep(currOld, false);
        currNew.next.prev = currOld.prev ? currOld.prev.siblingStep : undefined; ///
        currNew = currNew.next;
        currOld.siblingStep = currNew;
        currOld = currOld.next;
    }
    return firstNew;
}

function copyStep(step, isOriginal) { // isOriginal -> whether the new step is original
    let newStep = {
        stepStr:            step.stepStr,
        ancestor:           step.ancestor ? step.ancestor.siblingStep : undefined,
        next:               undefined,
        prev:               undefined,//step.prev ? step.prev.siblingStep : undefined,
        siblingStep:        step, 
        element:            undefined,
        isOriginalSteps:    isOriginal
    }
    if (step.isOriginalSteps) newStep.element = createElem(newStep, step.element.id + "c");
    else newStep.element = createElem(newStep, step.element.id);
    return newStep;
}

function prev() {
    index--;
    console.log("prev",currentStep);
    // if (isChangesMade) { // changes were made but not applied
    //     currentStep.element.remove();
    //     currentStep.element = createElem(currentStep, currentStep.element.id);
    //     tempStep = undefined;
    //     navigateHelper(currentStep, false);
    //     document.getElementById("apply").disabled = true;
    // }
    if (isChangesMade) { // changes were made but not applied
        discardChanges();
    }
    currentStep = currentStep.prev;
    navigateHelper(currentStep, false);
    // if (!step.next.ancestor) renderPrevElems(currentStep, false);
    return currentStep;
}

function next() {
    index++;
    // if (isChangesMade) { // changes were made but not applied
    //     currentStep.element.remove();
    //     currentStep.element = createElem(currentStep, currentStep.element.id);
    //     tempStep = undefined;
    //     navigateHelper(currentStep, true);
    //     document.getElementById("apply").disabled = true;
    // }
    if (isChangesMade) { // changes were made but not applied
        discardChanges();
    }
    currentStep = currentStep.next;
    navigateHelper(currentStep, true);
    // if (!step.ancestor) renderPrevElems(currentStep, true);
    return currentStep;
}

function discardChanges() {
    console.log("discardChanges", {changesMade});
    changesMade.forEach(change => {
        if (change.step) {
            let cs = change.step.oldStep;
            let el = createElem(cs, cs.element.id);
            cs.element.parentNode.replaceChild(el, cs.element);
            cs.element = el;
        }
        else if (change.suffix) {
            resetSuffix();
        }
    });
    changesMade = [];
    isChangesMade = false;
    navigateHelper(currentStep, true);
    document.getElementById("apply").disabled = true;
    if (!changesApplied) document.getElementById("reset").disabled = true;
}

function jumpToEnd() {
    let cs = currentStep;
    // resetPrevElems();
    while (cs) {
        cs = cs.next;
        if (cs) currentStep = next();
        // navigateHelper(cs,true);
    }
}

function jumpToStart() {
    let cs = currentStep;
    // resetPrevElems();
    while (cs) {
        cs = cs.prev;
        if (cs) currentStep = prev();
        // navigateHelper(cs,true);
    }

}

// Not in use atm
function jumpToStep(step) { ////
    let cs = currentFirst;
    // resetPrevElems();
    while (cs !== step) {
        // renderPrevElems(cs, true);
        // if (!cs.ancestor) renderPrevElems(cs, true);
        // cs = cs.next;
        cs = cs.next;
        if (cs) next();
    }
    // next();
    // updateViewCurElem(cs); // cs is step
    // currentStep = step;
}

function createElem(step, id) {
    const elem = document.createElement("div");

    if (step.stepStr.length === 2) {
        const start = document.createElement("div");
        start.innerText = step.stepStr[0];
        start.id = id + "s";
        start.contentEditable = true;
        start.spellcheck = false;
        const end = document.createElement("div");
        end.innerText = step.stepStr[1];
        end.id = id + "e";
        end.contentEditable = true;
        end.spellcheck = false;
        elem.appendChild(start);
        elem.appendChild(end);
    }
    else {
        elem.innerText = step.stepStr[0]; // createElement
        elem.contentEditable = true;
        elem.spellcheck = false;
    }
    elem.id = id;

    // prevent new-lines from being added by the user
    elem.addEventListener('beforeinput', (e) => {
        console.log("beforeinput", e);
        if (e.inputType === "insertParagraph") e.preventDefault();
    })
    
    elem.oninput = (e) => {
        textHandler(step, e.target.innerText, e.target.id);
    }
    
    return elem;
}

function navigateHelper(step, isNext) { // isNext is boolean representing direction
    // isChangesMade = false;
    updateViewCurElem(step, isNext, true);
    // let prevStep = step.prev;//getPrevElem(step);
    // console.log("step", step);
    // console.log("prevStep", prevStep);

    // if (isNext && !step.ancestor) renderPrevElems(prevStep, isNext); /

    // if (isNext) {
    //     if (!step.ancestor) renderPrevElems(prevStep, true);
    //     else 
    // }

    // if (!isNext && !step.next.ancestor) renderPrevElems(prevStep, false); /
}

function updateViewCurElem(step, isNext, isTraverse) {
    console.log("up", step);
    // url = generateURL(step); //
    // document.getElementById("preview").src = url; //
    // document.getElementById("URL").innerText = url; //

    if (!isTraverse) return;
    
    if (!isNext && step.next) { 
        step.next.element.remove();
        //toggleNav(step); //
        //return; //
    } 

    else if (step.ancestor) {
        console.log("append", step.element.innerText);
        // step.ancestor.element.empty();
        let el = document.getElementById(step.element.id);
        if (el) el.remove();
        appendLayer(step);
        // document.getElementById("transformation").appendChild(step.element); ////
    }
    else {
        // document.getElementById("transformation").innerText = '';
        // // document.getElementById("transformation").innerHTML = step.element;
        // document.getElementById("transformation").appendChild(step.element);
        // if ()
        if (step !== currentFirst) {
            document.getElementById("steps").appendChild(step.element);
        }
    }

    url = generateURL(step); //
    document.getElementById("preview").src = url; //
    document.getElementById("URL").innerText = url; //

    // const bu = beautifyURL(step);
    // document.getElementById("transformation").innerText = bu === '' ? "edit" : bu;
    toggleNav(step);
}

function appendLayer(step) {
    step.ancestor.element.insertBefore(step.element, step.ancestor.element.lastElementChild); 
    // document.getElementById(step.ancestor.element.lastElementChild).insertBefore
}

function toggleNav(step) {
    if (step === currentFirst) {
        document.getElementById("prev").disabled = true;
        document.getElementById("jumpToStart").disabled = true;
    } else {
        document.getElementById("prev").disabled = false;
        document.getElementById("jumpToStart").disabled = false;
    }
    if (!step.next) {
        document.getElementById("next").disabled = true;
        document.getElementById("jumpToEnd").disabled = true;
    } else {
        document.getElementById("next").disabled = false;
        document.getElementById("jumpToEnd").disabled = false;
    }
}

function reset() {
    console.log("reset");
    if (!isChangesApplied) return discardChanges();
    isChangesApplied = false;
    isChangesMade = false;
    resetSteps();
    resetSuffix();
    changesMade = [];
    resetPrevElems();
    updateViewCurElem(currentStep, true, true);
    document.getElementById("reset").disabled = true;
    document.getElementById("apply").disabled = true;
}

function resetSteps() { 
    console.log("resetSteps");
    changesMade.forEach(change => {
        if (change.step) {
            resetElems(change.step.oldStep, false); // retreive elements back to their original state
        }
        // else if (change.suffix) applySuffixChange(change);
    });

    firstStepChanged = copyStepsList(firstStepOriginal);

    currentFirst = firstStepOriginal;
    currentStep = firstStepOriginal;
    
}

function resetSuffix() {
    currentSuffix = suffixURL;
    document.getElementById("urlSuffix").innerText = suffixURL;
}

function resetStepElem(step) {
    step.element = createElem(step, step.element.id);
}

function resetElems(step, isDeep) { // isDeep => go to ancstors
    console.log("resetElems", step, isDeep);
    resetStepElem(step);
    if (isDeep) {
        while (step.ancestor) { 
            step = step.ancestor;
            resetStepElem(step);
        }
    }
}

function applyChanges() { 
    console.log("apply", changesMade);

    if (!changesMade.length) return;
    changesMade.forEach(change => {
        if (change.step) {
            applySingleChange(change);
            resetElems(change.step.oldStep, true); // retreive original elements to their original state
        }
        else if (change.suffix) applySuffixChange(change);
    });

    if (currentStep.isOriginalSteps) currentStep = currentStep.siblingStep;

    currentFirst = firstStepChanged;

    updateViewAllElems(currentStep, currentFirst);

    isChangesApplied = true;
    isChangesMade = false; 
    changesMade = []; 
    document.getElementById("apply").disabled = true;
    
}

function applySuffixChange(change) {
    currentSuffix = change.suffix.newSuffix;
}

function applySingleChange(change) {
    console.log("applySingleChange", {change, isChangesApplied});
    let tempStep = change.step.newStep; 
    let oldStep = change.step.oldStep;
    // let isChangesApplied = currentFirst === firstStepChanged;
    
    // if (!isChangesMade) return;
    if (!isChangesApplied) { // first click on apply (editing the original steps list) 
        let stepToSwitch = change.step.oldStep.siblingStep; 
        tempStep.prev = stepToSwitch.prev;
        tempStep.next = stepToSwitch.next;
        insertStep(tempStep,  tempStep.prev, tempStep.next);
        
        tempStep.siblingStep.siblingStep = tempStep;
        tempStep.siblingStep.element = createElem(tempStep.siblingStep, tempStep.siblingStep.element.id);
        
        // if step is ancestor - update all decendents
        updateDecendents(stepToSwitch, tempStep, firstStepChanged);
        
        //console.log("first applied", "tempStep",tempStep,"currentStep",currentStep);
    } else {
        let stepToSwitch = change.step.oldStep; 
        tempStep.prev = stepToSwitch.prev;
        tempStep.next = stepToSwitch.next;
        insertStep(tempStep, tempStep.prev, tempStep.next);
        tempStep.siblingStep = tempStep.siblingStep.siblingStep;
        tempStep.siblingStep.siblingStep = tempStep;

        if (change.step.oldStep === currentStep) currentStep = tempStep;
        updateDecendents(stepToSwitch, tempStep, firstStepChanged);
        console.log("applied", currentStep);
    }

    if (!tempStep.prev) firstStepChanged = tempStep;

}

function updateDecendents(oldStep, newStep, first) {
    let cs = first;
    while (cs) {
        if (cs.ancestor === oldStep) cs.ancestor = newStep;
        cs = cs.next;
    }
}

function updateViewAllElems(currentStep, currentFirst) {
    resetPrevElems();
    let cs = currentFirst;
    while (cs !== currentStep) {
        updateViewCurElem(cs, true, true); 
        cs = cs.next;
    }
    updateViewCurElem(cs, true, true); 
}

function insertStep(step, prev, next) {
    if (prev) {
        prev.next = step;
    }
    if (next) {
        next.prev = step;
    }
}

function generateURL(step) {

    return generateURLbyElems();

    let relevantComponents = [];
    
    while (step) {
        if (!step.ancestor) {
            let currRelTr = step.stepStr.slice(0); // create a copy of the array
            relevantComponents.push(currRelTr.join('/'));
            step = step.prev;
        }
        else {
            let currRelTr = [];
            let layersFound = [];
            let greatAncestor = step;
            while (greatAncestor.ancestor) {
                greatAncestor = greatAncestor.ancestor;
                layersFound.push(greatAncestor);
            }
            layersFound.forEach( layer => currRelTr.push(layer.stepStr[1]));
            currRelTr.reverse();
            currRelTr = currRelTr.concat(step.stepStr.slice(0).reverse());
            let cs = step.prev;
            while (cs.ancestor) {
                if (cs.ancestor !== greatAncestor && layersFound.find((a) => a !== cs.ancestor)) {
                    currRelTr.push(cs.ancestor.stepStr[1]);
                }
                currRelTr.push(cs.stepStr[0]);
                cs = cs.prev;
            } // cs is greatAncestor
            currRelTr.push(cs.stepStr[0]);
            currRelTr.reverse();
            relevantComponents.push(currRelTr.join('/'));
            step = cs.prev;
        }
    }

    relevantComponents.reverse();
    relevantComponents = relevantComponents.filter((t) => t !== '');
    const tr = relevantComponents.join('/');
    if (currentStep === currentFirst && !isChangesApplied) return prefixURL + '/' + currentSuffix;
    return  prefixURL + '/' + tr +  '/' + currentSuffix;
}

function generateURLbyElems(params) {

    let urlDirtyElem = document.getElementById("text");
    return urlDirtyElem.innerText.replace(/\n/g,'/');

}

function beautifyURL(step) {
    console.log("b",step.stepStr);
    return step.stepStr;// + "\n";
}

function textHandler(step, currTextValue, elemID) {
    // console.log("currTextValue", currTextValue, "elemID", elemID);
    // console.log("th-step",step);
    // console.log("step?",findStepByElem(elemID));
    console.log("textHandler - 1", step, currTextValue, elemID);
    step = findStepByElem(elemID);

    isChangesMade = true;
    document.getElementById("reset").disabled = false;
    document.getElementById("apply").disabled = false;
    const newTr = currTextValue;
    const isOriginal = step.isOriginalSteps;
    // if step is already in changed steps - update it
    let tempStep;
    let oldChange = changesMade.find(change => change.step && change.step.oldStep === step);
    if (oldChange) tempStep = oldChange.newStep;
    // const newElement = step.element.cloneNode(true);
    console.log("textHandler - 2", {tempStep,oldChange});
    if (!tempStep) {
        if (isOriginal) {
            tempStep = copyStep(step.siblingStep, false);
            // console.log("1 - element",tempStep);
            tempStep.siblingStep = step; ///
            tempStep.ancestor = step.siblingStep.ancestor; ///////////////////////////////////////////////
            tempStep.next = step.siblingStep.next;
            tempStep.prev = step.siblingStep.prev;
            
        } else {
            tempStep = copyStep(step, false);
            tempStep.siblingStep = step.siblingStep; /// siblingStep is always original
            tempStep.ancestor = step.ancestor; ///////////////////////////////////////////////
            tempStep.next = step.next;
            tempStep.prev = step.prev;
        }
    }
    if (step.stepStr.length === 2) {
        // console.log("thththth",elemID.charAt(elemID.length-1));
        let oldCompTr; // Complementary
        if (elemID.charAt(elemID.length-1) === 's') {
            oldCompTr = oldChange ? tempStep.stepStr[1] : step.stepStr[1];
            tempStep.stepStr = [newTr, oldCompTr];
        } 
        else { // elemID.charAt(elemID.length-1) === 'e'
            oldCompTr = oldChange ? tempStep.stepStr[0] : step.stepStr[0];
            tempStep.stepStr = [oldCompTr, newTr];
        }
    } else { //step.stepStr.length === 1
        tempStep.stepStr = [newTr];
    }
    
    tempStep.element = createElem(tempStep, tempStep.element.id);
    // console.log("element",tempStep.element);
    addChange({ step: {newStep: tempStep, oldStep: step} });
    
    console.log("textHandler - 3",{step, tempStep});
}

function addChange(newChange) {
    if  (newChange.step) {  
        let newStep = newChange.step.newStep;
        let oldStep = newChange.step.oldStep;
        let change = changesMade.find(change => change.step && change.step.oldStep === oldStep);
        if (change) change.step.newStep = newStep; // change.step exists
        else {
            change = newChange; //{ newStep, oldStep };
            if (oldStep.ancestor) { // sublayer should be positioned before their parents
                let ancestorChange = changesMade.find(change => change.step && change.step.oldStep === oldStep.ancestor);
                let ancestorIndex = changesMade.indexOf(ancestorChange);
                changesMade.splice(ancestorIndex, 0, change);
            }
            else changesMade.push(change); // {step: change}
        }
    }
    else if (newChange.suffix) { 
        changesMade.push(newChange);
    }
}

function findStepByElem(elemID) { 
    // console.log(elemID);
    let cs = currentFirst;
    while (cs) {
        if (cs.element) {
            if (cs.element.id === elemID || 
                cs.element.id+'s' === elemID || 
                cs.element.id+'e' === elemID) {
                    return cs;
            }
        }
        cs = cs.next;
    }
    return 1;
}

function renderPrevElems(prevStep, isNext) { //assumes elements were created (in next())
    // if (isNext) {
    //     document.getElementById("prevSteps").appendChild(prevStep.element);
    // } else {
    //     document.getElementById("prevSteps").removeChild(document.getElementById("prevSteps").lastChild);
    // }
    if (isNext) {
        document.getElementById("steps").appendChild(prevStep.element);
    } else {
        document.getElementById("steps").removeChild(document.getElementById("steps").lastChild);
    }
}

function resetPrevElems() {
    document.getElementById("steps").innerHTML = "";
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard
function copyURL() {
    const copyText = document.getElementById("URL").innerText;
    navigator.clipboard.writeText(copyText).then(function() {
        alert("URL copied to clipboard!");
    }, function() {
        alert("Error - Couldn't copy URL");
    });
}

function suffixHandler(innerText) { //changesMade /////////////////////////////
    console.log("suffix change");
    // suffixURL = innerText;
    let change = changesMade.find(change => change.suffix);
    if (change) change.suffix.newSuffix = innerText;
    else addChange({ suffix: { newSuffix: innerText, oldSuffix: currentSuffix } });
    document.getElementById("reset").disabled = false;
    document.getElementById("apply").disabled = false;
}
