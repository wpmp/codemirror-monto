var Sink = (function () {
    var sink = new WebSocket('ws://localhost:5003/');

    var parse = false;
    var parseService = "";
    var optionLanguage = 'all';

    var languages = [];
    var discoverResponse = [];
    var enabledServices = ["discover"];
    var availableServices = [];

    var triggerFunction = {};

    var products = {};

    function toHtmlString(content) {
        return sprintf('<pre>%s</pre>', JSON.stringify(content, null, 2).replace('<', '&lt').replace('>', '&gt'));
    }

    sink.onmessage = function (rawMessage) {
        if (parse) {
            var message = JSON.parse(rawMessage.data);
            if (message.product !== undefined) {
                processNewProduct(message);
            } else {
                acceptNewDiscoverResponse(message);
            }
            parse = false;
            parseService = "";
        } else {
            var index = enabledServices.indexOf(rawMessage.data);
            if (index > -1) {
                parse = true;
                parseService = rawMessage.data;
            }
        }
    };

    function processNewProduct(product) {
        product.service_id = parseService;
        var productForType = products[product.product];
        if (productForType === undefined || productForType === null) {
            products[product.product] = [product];
        } else {
            var index = -1;
            for (var i = 0; i < productForType.length; i++) {
                var existingProduct = productForType[i];
                if (existingProduct.service_id === product.service_id && (existingProduct.source !== product.source || existingProduct.version_id < product.version_id)) {
                    index = i;
                }
            }
            if (index > -1) {
                products[product.product][index] = product;
            } else {
                products[product.product].push(product);
            }
        }
        var tabID = '#tab-' + product.service_id;
        if ($(tabID).length > 0) {
            $(tabID).html(toHtmlString(product));
        } else {
            $('#products-tabs').append('<li role="presentation"><a class="product-tab" href="' + tabID + '">' + product.service_id + '</a></li>');
            $('#products-div').append('<div role="tabpanel" id="tab-' + product.service_id + '" class="tab-pane"></div>');
        }

        //if (product.product === 'tokens' && (product.source !== tokens.source || product.version_id > tokens.version_id)) {
        //    tokens = product;
        //    $('#tab-tokens').html(toHtmlString(product));
        //} else if (product.product === 'ast' && (product.source !== ast.source || product.version_id > ast.version_id)) {
        //    ast = product;
        //    $('#tab-ast').html(toHtmlString(product));
        //} else if (product.product === 'outline' && (product.source !== outline.source || product.version_id > outline.version_id)) {
        //    outline = product;
        //    $('#tab-outline').html(toHtmlString(product));
        //} else if (product.product === 'completions' && (product.source !== codecompletion.source || product.version_id > codecompletion.version_id)) {
        //    codecompletion = product;
        //    $('#tab-codecompletion').html(toHtmlString(product));
        //} else if (product.product === 'errors' && (product.source !== errors.source || product.version_id > errors.version_id)) {
        //    errors = product;
        //    $('#tab-errors').html(toHtmlString(product));
        //}
        Sink.trigger(product.product);
    }

    function acceptNewDiscoverResponse(response) {
        $('#discoverResponse').html(toHtmlString(response));
        discoverResponse = response;

        languages.forEach(function (language) {
            $('#editor-' + language).remove();
            $('#config-' + language).remove();
        });

        var foundLanguages = [];
        var foundServices = [];

        response.forEach(function (service) {
            if (foundLanguages.indexOf(service.language) == -1) {
                foundLanguages.push(service.language);
                $('#editor-languages').append(sprintf('<li><a href="#" id="editor-%s" class="editor-language">%s</a></li>', service.language, service.language));
                $('#config-languages').append(sprintf('<li><a href="#" id="config-%s" class="config-language">%s</a></li>', service.language, service.language));
            }
            foundServices.push(service);
        });

        var configMsg = Source.getConfigurationMessage();
        availableServices.forEach(function (service) {
            if (!foundServices.indexOf(service) > -1) {
                $('#row-' + service.service_id).remove();
                var serviceIndex = -1;
                configMsg.configure_services.forEach(function (config, index) {
                    if (config.service_id === service.service_id) {
                        serviceIndex = index;
                    }
                });
                configMsg.configure_services.splice(serviceIndex, 1);
            }
        });
        Source.setConfigurationMessage(configMsg);

        availableServices = foundServices;
        languages = foundLanguages;
        buildServiceOptions();
        buildConfigurationOptions();
    }

    function buildServiceOptions() {
        availableServices.forEach(function (service) {
            if (optionLanguage === 'all' || service.language === optionLanguage) {
                var tr = $('#row-' + service.service_id);
                if (tr.length === 0) {
                    var serviceStr = localStorage.getItem('selectedServices');
                    var services = (serviceStr === '' || serviceStr === null || serviceStr === undefined) ? [] : JSON.parse(serviceStr);
                    var checked = '';
                    if (services.indexOf(service.service_id) > -1) {
                        checked = 'checked';
                        enabledServices.push(service.service_id);
                    }
                    $('#services').append(sprintf(
                        '<tr id="row-%s">' +
                        '<td class="mid-align">' +
                        '<div class="checkbox checkbox-primary">' +
                        '<input id="%s" type="checkbox" class="discoverOption styled" %s>' +
                        '<label for="%s">%s</label>' +
                        '</div>' +
                        '</td>' +
                        '<td class="mid-align">%s</td>' +
                        '<td class="mid-align">%s</td>' +
                        '<td class="mid-align">%s</td>' +
                        '<td class="mid-align">%s</td>' +
                        '</tr>'
                        , service.service_id, service.service_id, checked, service.service_id, service.service_id,
                        service.label, service.description, service.language, service.product));
                }
            } else {
                $('#row-' + service.service_id).remove();
            }
        });
    }

    function buildConfigurationOptions() {
        var configMsg = Source.getConfigurationMessage();
        availableServices.forEach(function (service) {
            var panel = $('#options-' + service.service_id);
            var serviceConfig = [];
            var content = parseConfigurationOptions(service.options, service, serviceConfig, []);
            if (panel.length === 0) {
                $('#options').append(content);
            }
            configMsg.configure_services.push({service_id: service.service_id, configurations: serviceConfig});
        });
        Source.setConfigurationMessage(configMsg);
    }

    function parseConfigurationOptions(options, service, serviceConfig, required_options) {
        if (options !== undefined && options !== null) {
            var content = '<div id="options-' + service.service_id + '" class="panel panel-primary panel-default cm-s-monto"><div class="panel-body">';
            options.forEach(function (option) {
                var id = service.service_id + '-' + option.option_id;
                var config = localStorage.getItem(id);
                var value;
                var disabled = '';
                if (required_options !== null && required_options !== undefined && required_options.length > 0) {
                    var acc = true;
                    required_options.forEach(function (required_option) {
                        acc = 'true' === localStorage.getItem(service.service_id + '-' + required_option) && acc;
                        $(document).on('change', '#' + service.service_id + '-' + required_option, function (e) {
                            if (e.target.checked) {
                                $('#' + id).prop('disabled', false);
                            } else {
                                $('#' + id).prop('disabled', true);
                            }
                        });
                    });
                    disabled = acc ? '' : 'disabled';
                }
                if (option.type === "number") {
                    value = (config === null || config === undefined || config === '') ? option.default_value : parseInt(config);
                    content += buildNumberOption(config, option, id, disabled, value);
                } else if (option.type === "text") {
                    value = (config === null || config === undefined) ? option.default_value : config;
                    content += buildTextOption(config, option, id, disabled, value);
                } else if (option.type === "boolean") {
                    value = (config === null || config === undefined) ? option.default_value : 'true' === config;
                    content += buildBooleanOption(config, option, id, disabled, value);
                } else if (option.type === "xor") {
                    value = (config === null || config === undefined || config === '') ? option.default_value : config;
                    content += buildXorOption(config, option, id, disabled, value);
                } else if (option.type === undefined && option.members !== undefined) {
                    content += buildGroupOption(option, required_options, service, serviceConfig);
                }

                if (option.type !== undefined && option.members === undefined) {
                    serviceConfig.push({option_id: option.option_id, value: value});
                }
            });
            content += '</div></div>';
            return content;
        }
    }

    function buildNumberOption(config, option, id, disabled, value) {
        localStorage.setItem(id, value);
        return sprintf(
            '<div>' +
            '<input type="number" class="config" id="%s" placeholder="%s" min="%s" max="%s" value="%s" %s> %s' +
            '</div>'
            , id, option.default_value, option.from, option.to, value, disabled, option.label
        );
    }

    function buildTextOption(config, option, id, disabled, value) {
        localStorage.setItem(id, value);
        return sprintf(
            '<div>' +
            '<input type="text" class="config" id="%s" placeholder="%s" value="%s" %s> %s' +
            '</div>'
            , id, option.default_value, value, disabled, option.label
        );
    }

    function buildBooleanOption(config, option, id, disabled, value) {
        localStorage.setItem(id, value);
        return sprintf(
            '<div class="checkbox checkbox-primary">' +
            '<input type="checkbox" class="config styled" id="%s" %s %s>' +
            '<label for="%s">%s</label>' +
            '</div>'
            , id, value ? 'checked ' : '', disabled, id, option.label
        );
    }

    function buildXorOption(config, option, id, disabled, value) {
        localStorage.setItem(id, value);
        var content = sprintf(
            '<div class="btn-group">' +
            '<button id="%s" type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" %s>' +
            '<span id="selected-%s">%s</span>' +
            '<span class="caret"></span>' +
            '</button>' +
            '<ul id="%s-options" class="dropdown-menu">'
            , id, disabled, id, value, id
        );
        option.values.forEach(function (xorOption, value) {
            content += sprintf(
                '<li><a href="#" id="%s-%s" class="config-dropdown %s-option">%s</a></li>'
                , id, xorOption, id, xorOption
            );
        });
        content += '</ul></div> ' + option.label;
        return content;
    }

    function buildGroupOption(option, required_options, service, serviceConfig) {
        required_options.push(option.required_option);
        var content = parseConfigurationOptions(option.members, service, serviceConfig, required_options);
        var index = required_options.indexOf(option.required_option);
        if (index > -1) {
            required_options.splice(index, 1);
        }
        return content;
    }

    return {
        getProducts: function () {
            return products;
        },
        getProductsByType: function (type) {
            return products[type];
        },
        getActiveProductsByType: function (type) {
            var enabledProductsByType = [];
            var productsByType = products[type];
            if (productsByType === undefined || productsByType === null) {
                return [];
            }
            productsByType.forEach(function (product) {
                if (enabledServices.indexOf(product.service_id) > -1 && product.language === Source.getMessage().language) {
                    enabledProductsByType.push(product);
                }
            });
            return enabledProductsByType;
        },
        getProductByServiceID: function (serviceID) {
            for (var i in products) {
                for (var j in products[i]) {
                    if (products[i][j].service_id === serviceID) {
                        return products[i][j];
                    }
                }
            }
            return null;
        },
        resetProducts: function () {
            products = {};
        },
        onTypeTriggerFunction: function (productType, func) {
            var list = triggerFunction[productType];
            if (list === undefined || list === null) {
                triggerFunction[productType] = [func];
            } else {
                triggerFunction[productType].push(func);
            }
        },
        trigger: function (productType) {
            var list = triggerFunction[productType];
            if (list === undefined || list === null) {
                return;
            }
            triggerFunction[productType].forEach(function (func) {
                func();
            });
        },
        triggerAll: function () {
            for (var product in triggerFunction) {
                triggerFunction[product].forEach(function (func) {
                    func();
                });
            }
        },
        setOptionsLanguage: function (language) {
            optionLanguage = language;
            buildServiceOptions();
        },
        enableService: function (serviceID) {
            var index = enabledServices.indexOf(serviceID);
            if (index == -1) {
                enabledServices.push(serviceID);
                var serviceStr = localStorage.getItem('selectedServices');
                var services = (serviceStr === '' || serviceStr === null || serviceStr === undefined) ? [] : JSON.parse(serviceStr);
                services.push(serviceID);
                localStorage.setItem('selectedServices', JSON.stringify(services));
            }
        },
        disableService: function (serviceID) {
            var index = enabledServices.indexOf(serviceID);
            if (index > -1) {
                enabledServices.splice(index, 1);
                var serviceStr = localStorage.getItem('selectedServices');
                var services = (serviceStr === '' || serviceStr === null || serviceStr === undefined) ? [] : JSON.parse(serviceStr);
                services.splice(services.indexOf(serviceID), 1);
                localStorage.setItem('selectedServices', JSON.stringify(services));
            }
        }
    };
})();