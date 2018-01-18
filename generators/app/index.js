var Generator = require('yeoman-generator');

module.exports = class extends Generator {

    // note: arguments and options should be defined in the constructor.
    constructor(args, opts) {
        super(args, opts);
        // This makes `appname` a required argument.
//        this.argument('appname', {type: String, required: false});
        // And you can then access it later; e.g.
//        this.log(this.options.appname);
    }

//    installingLodash() {
//        this.npmInstall(['gulp'], {'save-dev': true});
//    }
    // -------------------------------------------------------------------------
    prompting() {
        return this.prompt(
                [
                    {
                        type: 'input',
                        name: 'moduleName',
                        message: 'A name of your app:',
                        validate: function (input) {
                            if (/.+/.test(input)) {
                                return true;
                            }
                            return 'Please enter a app name';
                        },
                        default: this.appname
                    },
                    {
                        type: 'input',
                        name: 'author',
                        message: 'Your full name:',
                        default: this.user.git.name
                    },
                    {
                        type: 'input',
                        name: 'email',
                        message: 'Your email:',
                        validate: function (input) {
                            if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(input)) {
                                return true;
                            }
                            return 'Please enter a valid email address';
                        },
                        default: this.user.git.email
                    },
                    {
                        type: 'input',
                        name: 'description',
                        message: 'One-line description of your module:',
                        validate: function (input) {
                            if (/.+/.test(input)) {
                                return true;
                            }
                            return 'Please, enter a brief description of your module';
                        },
                        default: "simple HTML/CSS/JS app"
                    },
                    {
                        type: 'input',
                        name: 'keywords',
                        message: 'List of keywords for your module, separated by comma:',
                        validate: function (input) {
                            if (/.+/.test(input)) {
                                return true;
                            }
                            return 'Please enter a comma-separated list of keywords';
                        },
                        default: "html css js"
                    },
                    {
                        type: 'list',
                        name: 'license',
                        message: 'License identifier (see https://spdx.org/licenses/ for all choices):',
                        choices: ["MIT", "Apache 2.0", "Mozilla Public License 2.0", "BSD 2-Clause (FreeBSD) License", "BSD 3-Clause (NewBSD) License", "Internet Systems Consortium (ISC) License", "GNU AGPL 3.0", "Unlicense", "No License (Copyrighted)"],
                        default: "MIT"
                    }
                ]
                )
                .then((props) => {

                    this.props = {

                        moduleName: props.moduleName,
                        description: props.description,
                        gitUrl: props.gitUrl,
                        keywords: props.keywords,
                        license: props.license,
                        author: {
                            name: props.author,
                            email: props.email
                        }
                    };

                });
    }

    paths() {
        this.log(this.destinationRoot());
    }

    writing() {
        this.fs.copyTpl(
                this.templatePath('index.html'),
                this.destinationPath('./index.html'),
                {title: this.props.moduleName}
        );
        this.fs.copy(
                this.templatePath('scss/'),
                this.destinationPath('./dev/assets/scss/')
                );
        this.fs.copy(
                this.templatePath('js/'),
                this.destinationPath('./dev/assets/js/')
                );
        this.fs.copy(
                this.templatePath('fonts/'),
                this.destinationPath('./dev/assets/fonts/')
                );
        this.fs.copy(
                this.templatePath('images/'),
                this.destinationPath('./dev/assets/images/')
                );
        this.fs.copyTpl(
                this.templatePath('_package.json'),
                this.destinationPath('./package.json'),
                {config: this.props}
        );
        this.fs.copyTpl(
                this.templatePath('_bower.json'),
                this.destinationPath('./bower.json'),
                {config: this.props}
        );
        this.fs.copyTpl(
                this.templatePath('_webpack.config.js'),
                this.destinationPath('webpack.config.js'),
                {config: this.props}
        );
        this.fs.copy(
                this.templatePath('.babelrc'),
                this.destinationPath('./.babelrc'),
                {config: this.props}
        );
        this.fs.copy(
                this.templatePath('.eslintrc'),
                this.destinationPath('./.eslintrc'),
                {config: this.props}
        );
        this.fs.copy(
                this.templatePath('.stylelintrc.json'),
                this.destinationPath('./.stylelintrc.json'),
                {config: this.props}
        );
        this.fs.copy(
                this.templatePath('.csscomb.json'),
                this.destinationPath('./.csscomb.json'),
                {config: this.props}
        );
        this.fs.copy(
                this.templatePath('.gitignore'),
                this.destinationPath('./.gitignore'),
                {config: this.props}
        );

//        this.config.set('coffeescript', false);

    }

    install() {
        this.installDependencies();
    }

};