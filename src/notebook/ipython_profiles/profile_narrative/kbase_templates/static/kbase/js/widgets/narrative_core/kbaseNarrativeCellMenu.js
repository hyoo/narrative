define(['jquery', 'kbwidget'], function($) {
    $.KBWidget({
        name: 'kbaseNarrativeCellMenu',
        parent: 'kbaseWidget',
        options: {cell: null, kbWidget:null, kbWidgetType:null},

        init: function(options) {
            this._super(options);

            // console.log(['cell menu', this.options.cell]);

            var $deleteBtn = $('<button type="button" class="btn btn-default btn-xs" data-toggle="tooltip" data-placement="left" Title="Delete Cell">')
                             .css({"background-color": "transparent"})
                             .append($('<span class="fa fa-trash-o" style="font-size:14pt; padding-left: 5px;">'))
                             .click($.proxy(function() {
                                 this.trigger('deleteCell.Narrative', IPython.notebook.get_selected_index());
                             }, this));

            var $btn = $('<button type="button" data-toggle="dropdown" aria-haspopup="true" class="btn btn-default btn-xs">')
                       .css({"background-color": "transparent"})
                       .append($('<span class="fa fa-cog" style="font-size:14pt">'));

            this.$menu = $('<ul>')
                         .addClass('dropdown-menu')
                         .css({
                                'right' : '0',
                                'left' : 'auto',
                                'margin' : '0'
                         });

            if (window.kbconfig && window.kbconfig.mode === "debug") {
                this.addMenuItem({
                    icon: 'fa fa-code',
                    text: 'View Job Submission',
                    action: function() {
                        var metadata = IPython.notebook.get_selected_cell().metadata;
                        var stackTrace = [];
                        if (metadata['kb-cell'] && metadata['kb-cell']['stackTrace'])
                            stackTrace = metadata['kb-cell']['stackTrace'];
                        console.log(stackTrace);
                        var cell = IPython.notebook.insert_cell_below('code');
                        if (stackTrace instanceof Array) {
                            cell.set_text('job_info=' + stackTrace[stackTrace.length - 1] + '\njob_info');
                            IPython.notebook.get_selected_cell().execute();
                        }
                        else {
                            cell.set_text('job_info=' + stackTrace);
                        }
                    }
                });
            }

            this.addMenuItem({
                icon: 'fa fa-arrow-up',
                text: 'Move Cell Up',
                action: function() {
                    IPython.notebook.move_cell_up();
                }
            });

            this.addMenuItem({
                icon: 'fa fa-arrow-down',
                text: 'Move Cell Down',
                action: function() {
                    IPython.notebook.move_cell_down();
                }
            });

            this.addMenuItem({
                icon: 'fa fa-caret-square-o-up',
                text: 'Insert Cell Above',
                action: function() {
                    var cell = IPython.notebook.insert_cell_above('markdown');
                }
            });

            this.addMenuItem({
                icon: 'fa fa-caret-square-o-down',
                text: 'Insert Cell Below',
                action: function() {
                    var cell = IPython.notebook.insert_cell_below('markdown');
                }
            });

            // only add this if it was controlled by a KBase Widget
            if(this.options.kbWidget && this.options.kbWidgetType) {
                this.addMenuItem({
                    icon: 'fa fa-copy',
                    text: 'Duplicate Cell',
                    action: $.proxy(function() {
                        // get the current state, and clear it of its running state
                        var kbWidget = options.kbWidget
                        var currentState = kbWidget.getState();
                        if(this.options.kbWidgetType === 'method') {
                            // put the method in the narrative
                            this.trigger('methodClicked.Narrative', kbWidget.method);

                            // the method initializes an internal method input widget, but in an async way
                            // so we have to wait and check when that is done.  When it is, we can update state
                            var newCell = IPython.notebook.get_selected_cell();
                            var newWidget = $('#'+$(newCell.get_text())[0].id).kbaseNarrativeMethodCell();
                            var updateState = function(state) {
                                if(newWidget.$inputWidget) {
                                    // if the $inputWidget is not null, we are good to go, so set the state
                                    newWidget.loadState(currentState.params);
                                } else {
                                    // not ready yet, keep waiting
                                    window.setTimeout(updateState,500);
                                }
                            };
                            window.setTimeout(updateState,50);

                        }
                    }, this)
                });
            }

            // if (this.options.cell && this.options.cell.metadata['kb-cell'] === undefined) {
            //     this.addMenuItem({
            //         icon: 'fa fa-terminal',
            //         text: 'Toggle Cell Type',
            //         action: function() {
            //             if (this.options.cell.cell_type === "markdown") {
            //                 IPython.notebook.to_code();
            //             }
            //             else {

            //             }
            //         },
            //         disable: true
            //     });
            // }

            this.addMenuItem({
                icon: 'fa fa-trash-o',
                text: 'Delete Cell',
                action: $.proxy(function() {
                                    this.trigger('deleteCell.Narrative', IPython.notebook.get_selected_index());
                                }, this)
            });

            // this shows whether the app is running
            this.$runningIcon = $("<span>").addClass("fa fa-circle-o-notch fa-spin")
                                .css({"color": "rgb(42,121,191)"})
                                .hide();
            // this shows on error
            this.$errorIcon =  $("<span>").addClass("fa fa-exclamation-triangle")
                              .css({"color": "red"})
                              .hide();

            this.$elem.append(
                $('<span>')
                    .append(this.$runningIcon)
                    .append(this.$errorIcon)
                    .append($deleteBtn)
                    .append($('<span class="dropdown">')
                              .append($btn)
                              .append(this.$menu)));
            $deleteBtn.tooltip();

            return this;
        },

        addMenuItem: function(item) {
            var label = '';
            if (item.icon)
                label += '<span class="' + item.icon +'"></span> ';
            if (item.text)
                label += ' ' + item.text;
            var $item = $('<a>')
                        .append(label)
                        .click($.proxy(function(event) {
                            event.preventDefault();
                            event.stopPropagation();
                            if (!item.disable) {
                                if (item.action)
                                    item.action();
                                this.$menu.dropdown('toggle');
                            }
                        }, this));
            var $itemElem = $('<li>').append($item);
            if (item.disable)
                $itemElem.addClass('disabled');
            this.$menu.append($itemElem);
        },
    });
});
