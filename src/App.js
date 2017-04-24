import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Parser from "./parser";
var Literal = require('../src/Literal').Literal;

class App extends Component {
    constructor(props) {
        super(props);
        Parser.init();
        this.state = {
            result:new Literal(0),
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
                <div className="hbox">
                    <input type="text" value={this.state.text} ref="input"
                           onChange={this.changed.bind(this)}
                           onKeyDown={this.keydown.bind(this)}/>
                    <button onClick={this.click.bind(this)}>Calculate</button>
                </div>
                <h2>
                    <span>{this.renderResult()}</span>
                </h2>
            </div>
        );
    }
    renderResult() {
        if(this.state.crashed) {
            return "error";
        }
        var lit = this.state.result;
        if(!lit.value.isFinite()) {
            return "\u221E";
        }
        return lit.toString();
    }
}

export default App;
