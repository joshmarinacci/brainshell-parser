import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Parser from "./parser";
var LiteralNumber = require('../src/LiteralNumber').LiteralNumber;
var LiteralString = require('../src/LiteralString').LiteralString;
var style = require('../src/styler').style;

class App extends Component {
    constructor(props) {
        super(props);
        Parser.init();
        this.state = {
            result:new LiteralNumber(0),
            text:"4 + 6",
            crashed:false,
            error:null
        }
    }
    keydown(e) {
        if(e.keyCode == 13) {
            this.click();
        }
    }
    changed() {
        var txt = this.refs.input.value;
        this.setState({text:txt});
    }
    click() {
        var txt = this.refs.input.value;
        try {
            var val = Parser.parseString(txt);
            this.setState({result: val, crashed:false, error:null});
        } catch (e) {
            console.log("crashed occurred while parsing",e);
            this.setState({crashed:true, error:e});
        }
    }
    render() {
        return (
            <div className="vbox center">
                <h1>Jesse Calculator</h1>
                <div className="hbox line">
                    <input type="text" value={this.state.text} ref="input"
                           onChange={this.changed.bind(this)}
                           onKeyDown={this.keydown.bind(this)}/>
                    <button onClick={this.click.bind(this)}>Calculate</button>
                </div>
                <div className="result" dangerouslySetInnerHTML={{__html:this.renderResult()}}/>
              </div>
        );
    }
    renderResult() {
        if(this.state.crashed) {
            return "error";
        }
        return style(this.state.result);
        //if(!lit.value.isFinite()) {
        //    return "\u221E";
        //}
    }
}

export default App;
