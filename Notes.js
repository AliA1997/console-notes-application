const readlineSync = require('readline-sync');
const moment = require('moment');
const fs = require('fs');
const _ = require('lodash');


class Notes {
    constructor() {
        this.name = '';
        var self = this;
        var name = readlineSync.question("What is your name?");
        name.split(' ').forEach(n => self.name += _.capitalize(n) + ' ');
        this.name = this.name.trim();
        this.ticketNumber = readlineSync.question("What is the ticket number you would like to take notes for?");
        this.type =  _.capitalize(readlineSync.question("What would you like to write notes for?"));
        this.customNotes = [];
        this.children = [];
        this.canEdit = null;
        this.hasChildren = null;
        this.filename = "";
        this.currentDateTitle = moment(new Date()).format('MM/DD/YYYY hh:mm:ss a');
        this.currentDateFileName = moment(new Date()).format('MM-DD-YYYY');
        this.notes = `\nBasic Notes - ${this.ticketNumber} - Created ${this.currentDateTitle}- By ${this.name}\n`;
    }

}

Notes.prototype.createNotes = function() {
    var self = this;
    var origType = this.type;
    if(arguments[0]) {
        this.type =  arguments[0]
    }
    this.notes += `\nFor ${this.type}:\n`;
    this.notes += `\tGet one ${this.type}.\n`; 
    if(this.canEdit)
        this.notes += `\tEdit one ${this.type}, make sure fields are shown correctly and user readable.\n`;
    this.notes += `\tUpdate one ${this.type}. \n`;
    this.notes += `\tDelete one ${this.type}. \n`;
    this.notes += `\tCreate one ${this.type}. \n`;

    this.type = origType;
}

Notes.prototype.createCustomNotes = function() {
    var done = false;
    var i = 1;
    while(done === false) {
        var notesAnswer = readlineSync.question(`Custom note #${i}?`);
        this.customNotes.push(notesAnswer);
        var doAddMoreCustomNotes = readlineSync.question(`Do you want to add more custom notes?[Y], [N]`);
        if(this.returnBoolFromAnswer(doAddMoreCustomNotes) === true) {
            done = true;
            continue;
        }
        i++;
    }
    return;
}

Notes.prototype.addNotesForChildren = function(child) {
    this.notes += `\nFor ${child}:\n`;
    this.createNotes(child);    
}

Notes.prototype.addCustomNotes = function() {
    this.notes += `\nOther Notes:`; 
    if(this.customNotes.length)
        this.customNotes.forEach(note => this.notes += `\n\t${note}`);
}

Notes.prototype.returnBoolFromAnswer = function(answer, customIntendedResponse = null, isYes = false) {
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

Notes.prototype.answerQuestionsForChildren = function() {
    var done = false;
    while(done === false) {
        var answer = readlineSync.question("What is the type of children you are testing?");
        console.log("done:", done);
        this.children.push(answer);
        var stopAddingChildren = readlineSync.question('Any more type of children to test?[Y], [N]');
        console.log(this.returnBoolFromAnswer(stopAddingChildren));
        if(this.returnBoolFromAnswer(stopAddingChildren) === true)  {
            done = true;
        } 
    }
    return;
}

Notes.prototype.execute = function() {
    var self = this;
    var canEditAnswer = readlineSync.question("Does the edit functionality in the ui needs to be tested?[Y], [N]");
    var hasChildrenAnswer = readlineSync.question("Is there children or items for the related entity being tested? For example such as claim payment items for claim payments.[Y], [N]");
    var children = [];
    this.canEdit = this.returnBoolFromAnswer(canEditAnswer, null, true);
    this.hasChildren = this.returnBoolFromAnswer(hasChildrenAnswer, null, true);
    if(this.hasChildren === true) {
        this.answerQuestionsForChildren();
        if(this.children.length)
            this.children.forEach(child => {
                self.addNotesForChildren(child);
            });
    }

    this.createNotes();
    
    var wantToAddCustomNotes = readlineSync.question('Want to add custom notes for testing?[Y], [N]');
    if(this.returnBoolFromAnswer(wantToAddCustomNotes, null, true) === true) {
        this.createCustomNotes();
        this.addCustomNotes();
    }

    this.filename = `notes\\${this.ticketNumber}-Notes-${this.currentDateFileName}.txt`;
    fs.readFile(this.filename, error => {
        if(error) {
            fs.writeFile(this.filename, this.notes, error => {
                if(error)
                    console.log("Write Notes Error:", error);
            });
        } else {
            this.filename = this.filename.replace('.txt', `.${uuid()}`) + '.txt';
            fs.writeFile(this.filename, this.notes, error => {
                if(error)
                    console.log("Write Notes Error:", error);
            });
        } 
    });
}

module.exports = Notes;