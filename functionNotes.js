const fs = require('fs');
const readlineSync = require('readline-sync');
const moment = require('moment');
const _ = require('lodash');
const uuid = require('uuid');
const path = require('path');

let nameWhoCreatedNotes = readlineSync.question("What is your name?");
let ticketNumber = readlineSync.question("What is the ticket number you would like to take notes for?");
let currentDateForNotes = moment(new Date()).format('MM/DD/YYYY hh:mm:ss a');
let currentDateForFilename = moment(new Date()).format('MM-DD-YYYY');


let notes = `\nBasic Notes - ${ticketNumber} - Created ${currentDateForNotes}- By ${nameWhoCreatedNotes}\n`;
let customNotes = [];


function createNotes(type, canEdit = false, hasChildren = false, children = []) {
    type = _.capitalize(type);
    notes += `\nFor ${type}\n`;
    notes += `\tGet one ${type}.\n`; 
    if(canEdit)
        notes += `\tEdit one ${type}, make sure fields are shown correctly and user readable.\n`;
    notes += `\tUpdate one ${type}. \n`;
    notes += `\tDelete one ${type}. \n`;
    notes += `\tCreate one ${type}. \n`;
    if(hasChildren && children.length)
        children.forEach(child => addNotesForChildren(child));
}

function createCustomNotes() {
    var done = false;
    var i = 1;
    while(done === false) {
        var notesAnswer = readlineSync.question(`Custom note #${i}?`);
        customNotes.push(notesAnswer);
        var doAddMoreCustomNotes = readlineSync.question(`Do you want to add more custom notes?[Y], [N]`);
        if(returnBoolFromAnswer(doAddMoreCustomNotes) === true) {
            done = true;
            continue;
        }
        i++;
    }
    return;
}

function addNotesForChildren(child) {
    notes += `\nFor ${child}\n\n`;
    createNotes(child);
}

function addCustomNotes() {
    if(customNotes.length)
        customNotes.forEach(note => notes += `\n\t${note}`);
}

function returnBoolFromAnswer(answer, customIntendedResponse = null, isYes = false) {
    var answerTrimmed = answer.trim();
    if(customIntendedResponse) {
        return answerTrimmed.toLowerCase() === customIntendedResponse.toLowerCase();
    } 
    if(isYes) {
        return (
            answerTrimmed.toLowerCase() === "y" 
            || answerTrimmed.toUpperCase() === "Y"
            || answerTrimmed.toLowerCase() === "yes" 
            || answerTrimmed.toUpperCase() === "YES"
        ); 
    }
    return (
        answerTrimmed.toLowerCase() === "n" 
        || answerTrimmed.toUpperCase() === "N"
        || answerTrimmed.toLowerCase() === "no" 
        || answerTrimmed.toUpperCase() === "NO"
    );
}

function answerQuestionsForChildren(children) {
    var done = false;
    while(done === false) {
        var answer = readlineSync.question("What is the type of children you are testing?");
        children.push(answer);
        var stopAddingChildren = readlineSync.question('Any more type of children to test?[Y], [N]');
        console.log(returnBoolFromAnswer(stopAddingChildren));
        if(returnBoolFromAnswer(stopAddingChildren) === true)  {
            done = true;
            continue;
        } 
    }
    return children;
}

function execute() {
    var type = readlineSync.question("What would you like to write notes for?");
    var canEditAnswer = readlineSync.question("Does the edit functionality in the ui needs to be tested?[Y], [N]");
    var hasChildrenAnswer = readlineSync.question("Is there children or items for the related entity being tested? For example such as claim payment items for claim payments.[Y], [N]");
    var children = [];
    var canEdit = returnBoolFromAnswer(canEditAnswer, null, true);
    var hasChildren = returnBoolFromAnswer(hasChildrenAnswer, null, true);
    if(hasChildren === true)
        children = answerQuestionsForChildren(children);
  
    createNotes(type, canEdit, hasChildren, children);
    
    var wantToAddCustomNotes = readlineSync.question('Want to add custom notes for testing?[Y], [N]');
    if(returnBoolFromAnswer(wantToAddCustomNotes, null, true) === true) {
        createCustomNotes();
        addCustomNotes();
    }
    var filename = `notes\\${ticketNumber}-Notes-${currentDateForFilename}.txt`;
    fs.readFile(filename, error => {
        if(error) {
            fs.writeFile(filename, notes, error => {
                if(error)
                    console.log("Write Notes Error:", error);
            });
        } else {
            filename = filename.replace('.txt', `.${uuid()}`) + '.txt';
            fs.writeFile(filename, notes, error => {
                if(error)
                    console.log("Write Notes Error:", error);
            });
        } 
    });
}

execute();