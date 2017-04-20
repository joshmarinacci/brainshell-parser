import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Parser from "./parser";

class App extends Component {
    constructor(props) {
        super(props);
        Parser.init();
        this.state = {
            result:"result",
            text:"4 + 6",
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
        var val = Parser.parseString(txt);
        this.setState({result:val});
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
                    <span>{this.state.result}</span>
                </h2>
            </div>
        );
    }
}

export default App;
