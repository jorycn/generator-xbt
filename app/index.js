'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var del = require('del');


var TmTGenerator = yeoman.generators.Base.extend({

	// 初始化
	init: function () {

	},

	prompting: function () {
		var done = this.async();


		// 欢迎消息
		this.log(
			'\n     _-----_' +
			'\n    |       |' +
			'\n    |' + chalk.red('--(o)--') + '|   .------------------------------------------------.' +
			'\n   `---------´  |    ' + chalk.yellow.bold('Welcome to ') + chalk.magenta("tmt-workflow") + chalk.yellow.bold(' Yeoman generator,') + '   |' +
			'\n    ' + chalk.yellow('(') + ' _' + chalk.yellow('´U`') + '_ ' + chalk.yellow(')') + '   |       ' + chalk.yellow.bold('More configs in ') + chalk.red('`.tmtworkflowrc`') + '      |' +
			'\n    /___A___\\   \'________________________________________________\'' +
			'\n     ' + chalk.yellow('|  ~  |') +
			'\n   __' + chalk.yellow('\'.___.\'') + '__' +
			'\n ´   ' + chalk.red('`  |') + '° ' + chalk.red('´ Y') + ' `\n');

		// replace it with a short and sweet description of your generator
		this.log(chalk.magenta('开始配置工作流:`'));

		var prompts = [
			{
				name: 'projectName',
				message: '项目名: ',
				default: 'project-xxx'
			},
			{
				name: 'version',
				message: '版本号: ',
				default: '0.0.1'
			},
			{
				name: 'authorName',
				message: '作者: ',
				default: ''
			},
			{
				type: 'checkbox',
				name: 'features',
				message: '▬▬▬▬ 选择更多功能 <空格键> ▬▬▬▬',
				choices: [
					{
						name: '开启: LiveReload               // 文件变动触发浏览器自动刷新',
						value: 'includeLivereload',
						checked: true
					},
					{
						name: '开启: REM 支持                 // 自动完成 px -> rem 单位换算',
						value: 'includeRem',
						checked: false
					},
					{
						name: '开启: 智能 WebP 支持           // 自动生成 webp 格式并替换 CSS',
						value: 'includeWebp',
						checked: false
					},
		            {
			            name: '开启: 文件 Changed 支持        // 文只编译有变动的文件',
			            value: 'includeChanged',
			            checked: false
		          	},
					{
						name: '开启: 文件 Reversion 支持      // 文件采用 MD5 新文件名',
						value: 'includeReversion',
						checked: false
					}
				]
			},
			{
				type: 'confirm',
				name: 'needNpmInstall',
				message: chalk.green('配置完成, 项目创建成功!') + '\n  是否自动执行 ' + chalk.yellow('`npm install & gulp build_dev`') + ' ?',
			}
		];

		this.prompt(prompts, function (props) {
			for (var prop in props) {
				if (props.hasOwnProperty(prop)) {
					this[prop] = props[prop];
				}
			}

			console.log(props.projectName)
			this.projectName = props.projectName;
			var features = props.features;

			function hasFeature(feat) {
				return features.indexOf(feat) !== -1;
			}

			// include gulp config
			this.includeLivereload = hasFeature('includeLivereload');
			this.includeRem = hasFeature('includeRem');
			this.includeWebp = hasFeature('includeWebp');
			this.includeChanged = hasFeature('includeChanged');
			this.includeReversion = hasFeature('includeReversion');

			// 预留 bower
			// this.includeWeui = hasFeature('includeWeui');
			// this.includeZepto = hasFeature('includeZepto');
			// this.includeJquery = hasFeature('includeJquery');

			done();
		}.bind(this));
	},

	writing: function () {

		this.directory('project', this.projectName);
		this.directory('_tasks', '_tasks');

		this.copy('_.tmtworkflowrc', '.tmtworkflowrc');
		this.copy('_package.json', 'package.json');

		// 若需要用 bower 可以自行引入
		// this.copy('_bower.json', 'bower.json');
	},

	// 4. 目录建立完成后
	end: function () {

		this.installDependencies({
			bower: false,
			skipInstall: !this.needNpmInstall,
			callback: function () {
				if (this.needNpmInstall)
					this.spawnCommand('gulp', ['build_dev'], {cwd: this.projectName});
				else
					this.log(chalk.green('工作流初始化完毕, 请 `npm install` 安装依赖, 然后执行 `gulp build_dev` 运行`'));

			}.bind(this) // bind the callback to the parent scope
		});

	},

	projectfiles: function () {

		// 不同团队可自行设置代码代码格式规范
		// this.copy('editorconfig', '.editorconfig');
		// this.copy('jshintrc', '.jshintrc');
	}
});

module.exports = TmTGenerator;
