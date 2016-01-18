# Ember XMPP Instant Message Client

This Ember-CLI application implements a XMPP Instant Message Client. This application is created to demo the use of XMPP and Ember to create a highly scalable real time application based on XMPP technology. You can use this application as a boiler plate to add an instant messaging component to any ember or web application.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM) and [Bower](http://bower.io/)
* An XMPP BOSH Server like [OpenFire](https://www.igniterealtime.org/projects/openfire/)

## Installation

* `git clone https://github.com/rjaviervega/ember-xmpp-im` this repository
* change into the new directory
* `npm install`
* `bower install`


## Configuration

#### XMPP Server
* Download, install and setup Openfire server localy
* Create sample users using JID format: user@domain.com

#### Ember App
* Edit default settings `xmppConfig` on file `config/environment.js`

## Running / Development

* `ember server`
* Visit your app at http://localhost:4200.
* Login with your XMPP user/pass
* Subscribe to users to create your roster
* Click on a user to start chatting

## Screencast 
Watch this presentation on the Heroku SF Meet up about using EmberJS and XMPP.
<a href="https://www.youtube.com/watch?v=0Y-JhA3joZ4">
<img src="https://img.youtube.com/vi/0Y-JhA3joZ4/0.jpg" width="600" />
</a>

## Screenshots

<img src="https://raw.githubusercontent.com/rjaviervega/ember-xmpp-im/master/screenshots/Screen%20Shot%202014-12-26%20at%208.20.15%20PM.png" width="600"/>

<img src="https://raw.githubusercontent.com/rjaviervega/ember-xmpp-im/master/screenshots/Screen%20Shot%202014-12-26%20at%208.20.25%20PM.png" width="600">

<img src="https://raw.githubusercontent.com/rjaviervega/ember-xmpp-im/master/screenshots/Screen%20Shot%202014-12-26%20at%208.21.54%20PM.png" width="600">

## Lisence

This software is open source under GPL v3.0


