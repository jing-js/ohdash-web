import React from 'react';
import layoutHelper from '../struct/LayoutHelper';

class HintLine extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let hint = this.props.hint;
    let style = hint ? {
      left: hint.left | 0,
      top: hint.top | 0,
      width: hint.width | 0,
      height: hint.height | 0,
      lineHeight: (hint.height | 0) + 'px'
    } : null;
    let type = hint && hint.width > 1 ? 'hor' : 'ver';
    let title = hint ? hint.title : '';
    let show = hint && (hint.width > 1 || hint.height > 1) ;
    return (
      <div className={`hint-line ${type} ${hint && hint.isGrid ? 'blue' : 'red'}${hint && hint.tail ? ' tail' : ''}${show ? ' show' : ''}`} style={style}>
        <div className={'title'}>{title}</div>
      </div>
    );
  }
}

export default class LayoutHelper extends React.Component {
  constructor(props) {
    super(props);
    this._onUpdateHandler = this._onUpdate.bind(this);
    this.state = {
      left: null,
      right: null,
      top: null,
      bottom: null
    }
  }
  _onUpdate(hintType, hint) {
    if (hintType === 'all') {
      this.setState({
        left: hint,
        right: hint,
        top: hint,
        bottom: hint
      });
    } else {
      this.setState({
        [hintType]: hint
      });
    }
  }
  componentDidMount() {
    layoutHelper.on('update', this._onUpdateHandler);
  }
  componentWillUnmount() {
    layoutHelper.off('update', this._onUpdateHandler);
  }
  render() {
    let hints = this.state;
    return (
      <div className="dash-helper">
        <HintLine hint={hints.left} />
        <HintLine hint={hints.top} />
        <HintLine hint={hints.right} />
        <HintLine hint={hints.bottom} />
      </div>
    )
  }
}