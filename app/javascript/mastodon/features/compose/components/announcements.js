// Copied & Modified from https://github.com/lindwurm/mastodon
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Immutable from 'immutable';
import { Link } from 'react-router-dom';
import axios from 'axios';
import classnames from 'classnames';

class Announcement extends React.PureComponent {

  static propTypes = {
    item: ImmutablePropTypes.map,
  };

  render() {
    const { item } = this.props;

    const contents = [];
    contents.push(<div key='body' className='announcements__body'>{item.get('text')}</div>);
    if (item.get('icon')) {
      contents.push(
        <div key='icon' className='announcements__icon'>
          <img src={item.get('icon')} alt='' />
        </div>
      );
    }

    const url = item.get('url');

    const classname = classnames({
      'announcements__item': true,
      'announcements__item--clickable': !!url,
    });

    if (!url) {
      return (<div className={classname}>{contents}</div>);
    } else if (url.startsWith('/web/')) {
      return (<Link to={url.slice(4)} className={classname}>{contents}</Link>);
    } else {
      return (<a href={url} target='_blank' className={classname}>{contents}</a>);
    }
  }

}

const ONE_DAY = 24 * 60 * 60 * 1000;
const unexpired = (items, now) => items.filter((entry) => new Date(entry.get('expire')).getTime() > now);
const validTimeout = (items, now) => {
  const nextTick =  items.isEmpty() ? ONE_DAY : new Date(items.get(0).get('expire')).getTime() - now;
  return nextTick > ONE_DAY ? ONE_DAY : nextTick;
};

export default class Announcements extends React.PureComponent {

  state = {
    items: Immutable.List(),
  };

  constructor () {
    super();
    this.refresh();
  }

  componentWillUnmount() {
    this.cancelPolling();
  }

  updateAnnouncements = (items) => {
    const now = Date.now();
    const validItems = unexpired(items, now);
    this.setState({ items: validItems });
    const timeout = validTimeout(validItems, now);
    this.timer = setTimeout(this.refresh, timeout);
  };

  cancelPolling = () => {
    clearTimeout(this.timer);
  };

  refresh = () => {
    axios.get('https://mikutter.hachune.net/notification.json?platform=mastodon')
      .then(resp => this.updateAnnouncements(Immutable.fromJS(resp.data) || Immutable.List()))
      .catch(err => console.warn(err));
  };

  render() {
    const { items } = this.state;

    if (items.isEmpty()) {
      return null;
    }

    return (
      <ul className='announcements'>
        <li>
          <Announcement item={items.get(0)} />
        </li>
      </ul>
    );
  }

}
