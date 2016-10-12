(function ( window, $, Fancy ) {
    Fancy.require( {
        jQuery: false,
        Fancy : "1.0.8"
    } );
    var NAME    = "FancyDate",
        VERSION = "1.2.2",
        logged  = false;

    function formatDate( _date2, format ) {
        _date2 = _date2 ? new Date( _date2 ) : null;
        function getDayOfYear() {
            var onejan = new Date( _date2.getFullYear(), 0, 1 );
            return Math.ceil( (_date2 - onejan) / 86400000 );
        }

        function getDaySuffix() {
            var d   = _date2.getDate();
            var sfx = [ "th", "st", "nd", "rd" ];
            var val = d % 100;
            return sfx[ (val - 20) % 10 ] || sfx[ val ] || sfx[ 0 ];
        }

        function getWeek() {return Math.ceil( (_date2.getDate() - _date2.getDay()) / 7 );}

        function getDay() {
            var d = _date2.getDay();
            return d === 0 ? 7 : d;
        }

        function getWeekOfYear() {
            var onejan = new Date( _date2.getFullYear(), 0, 1 );
            return Math.ceil( ((_date2 - onejan) / 86400000 + onejan.getDay() + 1) / 7 );
        }

        function isLeapYear() {
            var yr = _date2.getFullYear();
            if ( parseInt( yr ) % 4 === 0 ) {
                if ( parseInt( yr ) % 100 === 0 ) {
                    if ( parseInt( yr ) % 400 !== 0 ) {return false;}
                    if ( parseInt( yr ) % 400 === 0 ) {return true;}
                }
                if ( parseInt( yr ) % 100 !== 0 ) {return true;}
            }
            if ( parseInt( yr ) % 4 !== 0 ) {return false;}
        }

        function parse() {
            format = format.split( "" );
            var m  = "", dateFormat = [], gi = 0, custom = false, i = 0;
            for ( i; i < format.length; i++ ) {
                custom = format[ i ] == "'" ? !custom : custom;
                if ( custom ) {if ( format[ i ] != "'" ) {dateFormat[ Math.max( 0, gi - 1 ) ] += format[ i ];} else {dateFormat[ Math.max( 0, gi - 1 ) ] = "";}} else if ( format[ i ] != "'" ) {
                    if ( format[ i ] == m ) {dateFormat[ gi - 1 ] += format[ i ];} else {
                        dateFormat[ gi ] = format[ i ];
                        gi++;
                    }
                    m = format[ i ];
                }
            }
            var _date       = _date2.getDate(), month = _date2.getMonth(), hours = _date2.getHours(), minutes = _date2.getMinutes(), seconds = _date2.getSeconds();
            var date_props  = {
                d   : _date,
                dd  : _date < 10 ? "0" + _date : _date,
                EE  : FancyDate.api.translate( "day.short." + _date2.getDay() )[ 0 ],
                EEE : FancyDate.api.translate( "day.short." + _date2.getDay() ),
                EEEE: FancyDate.api.translate( "day." + _date2.getDay() ),
                S   : getDaySuffix(),
                w   : getDay(),
                z   : getDayOfYear(),
                WW  : getWeekOfYear(),
                W   : getWeek(),
                M   : month + 1,
                MM  : month < 9 ? "0" + (month + 1) : month + 1,
                MMM : FancyDate.api.translate( "month.short." + _date2.getMonth() ),
                MMMM: FancyDate.api.translate( "month." + _date2.getMonth() ),
                n   : month + 1,
                t   : [ 31, isLeapYear() ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ][ _date2.getMonth() ],
                L   : isLeapYear() ? "1" : "0",
                yyyy: _date2.getFullYear(),
                yy  : (_date2.getFullYear() + "").substring( 2, 4 ),
                a   : hours > 12 ? "pm" : "am",
                A   : hours > 12 ? "PM" : "AM",
                g   : hours % 12 > 0 ? hours % 12 : 12,
                G   : hours > 0 ? hours : "12",
                h   : hours % 12 > 0 ? hours % 12 : 12,
                HH  : hours < 10 ? "0" + hours : hours,
                H   : hours,
                mm  : minutes < 10 ? "0" + minutes : minutes,
                m   : minutes,
                ss  : seconds < 10 ? "0" + seconds : seconds,
                s   : seconds
            };
            var date_string = "";
            for ( i = 0; i < dateFormat.length; i++ ) {
                var f = dateFormat[ i ];
                if ( f.match( /[a-zA-Z]/g ) && typeof date_props[ f ] != "undefined" ) {date_string += date_props[ f ];} else {date_string += f;}
            }
            date_string = date_string.replace( /\d/g, "" ) === "" ? date_string : date_string;
            return date_string;
        }

        if ( format && _date2 && _date2 != "Invalid Date" ) {return parse();}
    }

    function escapeRegExp( str ) {
        return str.replace( /[\-\[\]\/\{}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&" );
    }

    function dateToRegex( format ) {
        var regex = "";
        if ( format.match( /dd|DD/ ) === null ) {
            format = format.replace( /d|D/, "dd" );
        }
        if ( format.match( /mm|MM/ ) === null ) {
            format = format.replace( /m|M/, "mm" );
        }
        if ( format.match( /yyyy|YYYY/ ) === null ) {
            format = format.replace( /yyy|YYYY/, "yyyy" ).replace( /yy|YY/, "yyyy" ).replace( /y|Y/, "yyyy" );
        }
        for ( var i = format.length; i > 0; i-- ) {
            var str = format.substring( 0, i );
            str     = escapeRegExp( str );
            str     = str.replace( /(dd)|(DD)/g, "(?:0[1-9]|1[0-9]|2[0-9]|3[0-1])" ).replace( /(mm)|(MM)/g, "(?:0[1-9]|1[0-2])" ).replace( /d|D/, "[0-3]" ).replace( /m|M/, "[0-1]" ).replace( /(y)|(Y)/g, "[0-9]" );
            regex += "(^" + str + "$)";
            if ( i !== 1 ) {
                regex += "|"
            }
        }
        return new RegExp( regex );
    }

    function clearTime( date, complete ) {
        var d = new Date( date );

        if ( complete !== false ) {
            d.setHours( 0 );
            d.setMinutes( 0 );
        }
        d.setSeconds( 0 );
        d.setMilliseconds( 0 );
        return d;
    }

    /**
     *
     * @param element
     * @param settings
     * @returns {FancyDate}
     * @constructor
     */
    function FancyDate( element, settings ) {
        var SELF = this;
        if ( element[ 0 ].nodeName != "INPUT" ) {
            console.error( NAME + " needs an input to be bound to!" );
            return;
        }

        SELF.settings  = $.extend( {}, Fancy.settings[ NAME ], settings );
        SELF.visible   = false;
        SELF.calculate = {
            day   : 24 * 60 * 60 * 1000,
            hour  : 60 * 60 * 1000,
            minute: 60 * 1000,
            second: 1000
        };

        SELF.element = element;
        SELF.version = VERSION;
        SELF.name    = NAME;

        SELF.today    = clearTime( new Date() );
        SELF.current  = SELF.element.val() ? SELF.decode( SELF.element.val() ) : SELF.settings.current || new Date();
        SELF.selected = SELF.decode( SELF.element.val() );
        SELF.hour     = 0;
        SELF.minute   = 0;
        Fancy.watch( SELF, "selected", function ( prop, old, val ) {
            if ( val && val != old ) {
                setTimeout( function () {
                    SELF.element.val( SELF.encode( SELF.selected ) );
                }, 0 );
                return new Date( val );
            } else {
                return val;
            }
        } );

        SELF.init();
        return SELF;
    }


    FancyDate.api = FancyDate.prototype = {};
    FancyDate.api.version          = VERSION;
    FancyDate.api.name             = NAME;
    FancyDate.api.init             = function () {
        var SELF = this;
        if ( !logged ) {
            logged = true;
            Fancy.version( SELF );
        }
        SELF.element.addClass( SELF.name + "-element" );

        this.html = {
            wrapper      : $( "<div/>", {
                id: SELF.name + "-wrapper"
            } ),
            dialog       : $( "<div/>", {
                id: SELF.name + "-dialog"
            } ).attr( "onselectstart", function () {
                return false;
            } ),
            inner        : $( "<div/>", {
                id: SELF.name + "-inner"
            } ),
            previous     : $( "<div/>", {
                id     : SELF.name + "-previous",
                "class": SELF.name + "-button"
            } ),
            previousArrow: $( "<div/>", {
                "class": SELF.name + "-arrow"
            } ),
            next         : $( "<div/>", {
                id     : SELF.name + "-next",
                "class": SELF.name + "-button"
            } ),
            nextArrow    : $( "<div/>", {
                "class": SELF.name + "-arrow"
            } ),
            title        : $( "<div/>", {
                id: SELF.name + "-title"
            } ),
            year         : $( "<span/>", {
                id: SELF.name + "-year"
            } ),
            yearChanger  : $( "<div/>", {
                id: SELF.name + "-year-changer"
            } ),
            month        : $( "<span/>", {
                id: SELF.name + "-month"
            } ),
            header       : $( "<div/>", {
                id: SELF.name + "-header"
            } ),
            body         : $( "<div/>", {
                id: SELF.name + "-body"
            } ),
            footer       : $( "<div/>", {
                id: SELF.name + "-footer"
            } ),
            close        : $( "<div/>", {
                id     : SELF.name + "-close",
                "class": SELF.name + "-button",
                html   : SELF.translate( "button.close" )
            } ),
            today        : $( "<div/>", {
                id     : SELF.name + "-today",
                "class": SELF.name + "-button",
                html   : SELF.translate( "button.today" )
            } ),
            clear        : $( "<div/>", {
                id     : SELF.name + "-clear",
                "class": SELF.name + "-button",
                html   : SELF.translate( "button.clear" )
            } ),
            calendar     : $( "<div/>", {
                id: SELF.name + "-calendar"
            } ),
            hour         : $( "<div>", {
                id: SELF.name + "-hour-wrapper"
            } ),
            hourSlider   : $( "<div>", {
                id: SELF.name + "-hour-slider"
            } ),
            hourCursor   : $( "<div>", {
                id: SELF.name + "-hour-cursor"
            } ),
            minute       : $( "<div>", {
                id: SELF.name + "-minute-wrapper"
            } ),
            minuteSlider : $( "<div>", {
                id: SELF.name + "-minute-slider"
            } ),
            minuteCursor : $( "<div>", {
                id: SELF.name + "-minute-cursor"
            } ),
            days         : [],
            rows         : []
        };

        var oldValue = SELF.element.val();
        SELF.element.off( "." + NAME ).on( "keydown." + NAME, function ( e ) {
            setTimeout( function () {
                if ( (e.which | e.keyCode) === 9 ) {
                    SELF.close();
                }
            }, 2 );
        } ).on( "focus." + NAME + " touchstart." + NAME, function ( e ) {
            if ( Fancy.mobile && SELF.settings.preventMobileKeyboard ) {
                e.preventDefault();
                e.stopPropagation();
                $( "body" ).on( "click." + NAME, function ( e ) {
                    if ( !$( e.target ).closest( "#FancyDate-dialog" ).length ) {
                        $( "body" ).off( "click." + NAME );
                        SELF.close();
                    }
                } );
            }
            if ( !SELF.visible && SELF.settings.query( SELF.element ) ) {
                SELF.open();
            }
        } ).on( "blur." + NAME, function () {
            SELF.close();
        } ).on( "keypress." + NAME + " paste." + NAME, function ( e ) {
            var me = this;
            setTimeout( function () {
                var regex = dateToRegex( SELF.settings.format ),
                    exec  = regex.exec( me.value );
                if ( exec === null ) {
                    if ( me.value ) {
                        me.value = oldValue;
                        e.preventDefault();
                        e.stopPropagation();
                    } else {
                        SELF.clear();
                    }
                } else if ( exec[ 1 ] ) {
                    SELF.select( SELF.decode( me.value ) );
                }
                oldValue = me.value;
            }, 1 );
        } );
    };
    FancyDate.api.open             = function () {
        var SELF = this;
        if ( !SELF.element[ 0 ].disabled ) {
            if ( this.settings.free ) {
                $( "body" ).append( SELF.html.wrapper ).addClass( SELF.name );
                SELF.html.wrapper.append( SELF.html.dialog );
            } else {
                $( "body" ).append( SELF.html.dialog ).addClass( SELF.name );
            }
            SELF.html.dialog.append( SELF.html.inner );
            SELF.html.inner.append( SELF.html.header ).append( SELF.html.body ).append( SELF.html.footer );
            SELF.html.header.append( SELF.html.previous.append( SELF.html.previousArrow ) ).append( SELF.html.title ).append( SELF.html.next.append( SELF.html.nextArrow ) );
            SELF.html.body.html( SELF.html.calendar );
            SELF.html.footer.html( SELF.html.close ).append( SELF.html.today ).append( SELF.html.clear );

            SELF.html.dialog.hide();
            SELF.html.today.removeClass( "disabled" );
            if ( SELF.settings.max ) {
                if ( SELF.current > SELF.settings.max ) {
                    SELF.current = new Date( SELF.settings.max.getFullYear(), SELF.settings.max.getMonth(), SELF.settings.max.getDate() );
                }
                if ( SELF.today > SELF.settings.max ) {
                    SELF.html.today.addClass( "disabled" );
                }
            }
            if ( SELF.settings.min ) {
                if ( SELF.current < SELF.settings.min ) {
                    SELF.current = new Date( SELF.settings.min.getFullYear(), SELF.settings.min.getMonth(), SELF.settings.min.getDate() );
                }
                if ( SELF.today < SELF.settings.min ) {
                    SELF.html.today.addClass( "disabled" );
                }
            }


            function show() {
                SELF.html.dialog.show();
                SELF.visible = true;
                SELF.create();
                SELF.settings.onOpen.call( SELF );
            }

            if ( SELF.settings.animated ) {
                setTimeout( function () {
                    show();
                    SELF.html.dialog.addClass( "show" ).removeClass( "hide" );
                }, 0 );
            } else {
                show();
            }
        }

        return SELF;
    };
    FancyDate.api.close            = function () {
        var SELF = this;
        if ( !SELF.html.dialog.hasClass( "hide" ) ) {
            SELF.element.unbind( "." + SELF.name + ":prevent" );
            SELF.html.title.removeClass( NAME + "-year-open" );
            function hide() {
                SELF.html.wrapper.remove();
                SELF.html.dialog.remove();
                SELF.html.calendar.children().remove();
                SELF.html.header.children().remove();
                SELF.html.title.children().remove();
                SELF.element.unbind( "." + NAME + ":prevent" );
                SELF.element[ 0 ].blur();
                SELF.visible = false;
                SELF.settings.onClose.call( SELF );
                $( "body" ).removeClass( SELF.name );
            }

            if ( SELF.settings.animated ) {
                setTimeout( hide, 300 );
                SELF.html.dialog.addClass( "hide" ).removeClass( "show" );
            } else {
                hide();
            }
        }

        return SELF;
    };
    FancyDate.api.update           = function () {
        var SELF = this;
        SELF.html.calendar.html( "" );
        SELF.html.title.html( SELF.html.month.html( SELF.translate( "month." + SELF.current.getMonth() ) ) ).append( SELF.html.year.html( SELF.current.getFullYear() ) );
        SELF.create();
    };
    FancyDate.api.create           = function () {
        var SELF = this,
            current,
            i    = 0,
            n    = 0;
        if ( this.settings.checkMinAndMax ) {
            if ( this.settings.max ) {
                if ( this.settings.max < this.current ) {
                    this.current = new Date( this.settings.max.getFullYear(), this.settings.max.getMonth(), this.settings.max.getDate() );
                }
            }
            if ( this.settings.min ) {
                if ( this.settings.min > this.current ) {
                    this.current = new Date( this.settings.min.getFullYear(), this.settings.min.getMonth(), this.settings.min.getDate() );
                }
            }
        }
        this.html.title.append( this.html.month.html( this.translate( "month." + this.current.getMonth() ) ) ).append( this.html.year.html( this.current.getFullYear() ) );
        this.html.title.append( this.html.yearChanger );
        this.html.yearChanger.children().remove();
        var c;
        current = new Date( this.current.getFullYear(), this.current.getMonth(), 1 );
        if ( current.getDay() != 1 && current.getDay() != 0 ) {
            c       = new Date( this.current.getFullYear(), this.current.getMonth(), 0 );
            current = new Date( this.current.getFullYear(), this.current.getMonth() - 1, (c.getDate() - current.getDay() + 2) );
        } else if ( current.getDay() == 0 ) {
            c       = new Date( this.current.getFullYear(), this.current.getMonth(), 0 );
            current = new Date( this.current.getFullYear(), this.current.getMonth() - 1, (c.getDate() - 5) );
        } else {
            c       = new Date( this.current.getFullYear(), this.current.getMonth(), 0 );
            current = new Date( this.current.getFullYear(), this.current.getMonth() - 1, (c.getDate() - 6) );
        }

        var ul = $( "<ul/>" );

        function change( li, y ) {
            li.on( "click", function () {
                SELF.setYear( y );
            } );
        }

        this.html.yearChanger.append( ul );
        var yearFrom = this.current.getFullYear() - this.settings.yearBottom,
            yearTo   = this.current.getFullYear() + this.settings.yearTop;
        if ( this.settings.max ) {
            yearTo   = Math.min( yearTo, this.settings.max.getFullYear() );
            yearFrom = yearTo - this.settings.yearBottom - this.settings.yearTop;
            if ( this.settings.min ) {
                yearFrom = Math.max( yearFrom, this.settings.min.getFullYear() );
            }
        }
        else if ( this.settings.min ) {
            yearFrom = Math.max( yearFrom, this.settings.min.getFullYear() );
            yearTo   = yearFrom + this.settings.yearBottom + this.settings.yearTop;
            if ( this.settings.max ) {
                yearTo = Math.min( yearTo, this.settings.max.getFullYear() );
            }
        }
        for ( yearTo; yearTo >= yearFrom; yearTo-- ) {
            var li = $( "<li/>", { html: this.translate( "month." + this.current.getMonth() ) + " " + yearTo } );
            ul.append( li );
            change( li, yearTo )
        }

        this.html.days = [];
        this.html.rows = [];

        this.html.calendar.children().remove();
        if ( this.settings.showWeekHeader ) {
            var rowh = $( "<div/>", {
                id: this.name + "-rowh"
            } );
            this.html.calendar.append( rowh );

            function createHeader( day ) {
                var u = $( "<div/>", {
                    id     : SELF.name + "-rowh-" + day,
                    "class": SELF.name + "-rowh",
                    html   : SELF.translate( "day.short." + day )
                } );
                rowh.append( u );
            }

            createHeader( 1 );
            createHeader( 2 );
            createHeader( 3 );
            createHeader( 4 );
            createHeader( 5 );
            createHeader( 6 );
            createHeader( 7 );

        }
        while ( i < 6 ) {
            i++;
            this.html.rows[ i ] = $( "<div/>", {
                id     : this.name + "-row-" + i,
                "class": this.name + "-row"
            } );
            this.html.calendar.append( this.html.rows[ i ] );
            var day = 0;
            while ( day < 7 ) {
                day++;
                n++;
                var d = $( "<div/>", {
                    id     : this.name + "-day-" + n,
                    "class": this.name + "-day" + " " + this.name + "-button",
                    html   : current.getDate()
                } ).data( "date", current.getTime() );

                if ( this.settings.min && current.getTime() < new Date( this.settings.min ).getTime() ) {
                    d.addClass( "disabled" );
                }
                if ( this.settings.max && current.getTime() > new Date( this.settings.max ).getTime() ) {
                    d.addClass( "disabled" );
                }
                if ( current.getMonth() != this.current.getMonth() ) {
                    d.addClass( this.name + "-day-extern" );
                }
                if ( clearTime( current ).getTime() === clearTime( SELF.today ).getTime() ) {
                    d.addClass( this.name + "-day-today" );
                }
                if ( this.selected && clearTime( current ).getTime() === clearTime( this.selected ).getTime() ) {
                    d.addClass( this.name + "-active" );
                }

                current = new Date( current.setDate( current.getDate() + 1 ) );
                this.html.days.push( d );
                this.html.rows[ i ].append( d );

            }
        }

        var width = this.html.body.outerWidth() / 7;
        $( this.html.days ).each( function () {
            $( this ).css( {
                width: parseInt( width + 1 - parseInt( $( this ).css( "paddingLeft" ) ) - parseInt( $( this ).css( "paddingRight" ) ) )
            } );
        } );
        $( "." + this.name + "-rowh" ).each( function () {
            $( this ).css( {
                width: parseInt( width + 1 - parseInt( $( this ).css( "paddingLeft" ) ) - parseInt( $( this ).css( "paddingRight" ) ) )
            } );
        } );
        if ( this.settings.time ) {
            this.html.calendar.append( this.html.hour );
            this.html.calendar.append( this.html.minute );

            this.html.hour.append( this.html.hourSlider );
            this.html.hour.append( this.html.hourCursor );

            this.html.minute.append( this.html.minuteSlider );
            this.html.minute.append( this.html.minuteCursor );
        }

        if ( this.settings.free ) {
            this.html.dialog.css( {
                marginTop : (window.innerHeight - this.html.dialog.outerHeight()) / 2,
                marginLeft: (window.innerWidth - this.html.dialog.outerWidth()) / 2
            } );
        } else {
            var css = {
                position: "absolute",
                left    : this.element.offset().left,
                top     : this.element.offset().top + this.element.outerHeight()
            };
            if ( css.top + this.html.dialog.outerHeight() > window.innerHeight ) {
                css.top = this.element.offset().top - this.html.dialog.outerHeight();
            }
            this.html.dialog.css( css );
        }

        this.addEventListener();
        return this;
    };
    FancyDate.api.addEventListener = function () {
        var SELF = this;

        for ( var i = 0; i < this.html.days.length; i++ ) {
            $( this.html.days[ i ] ).on( "click", function ( e ) {
                if ( !$( this ).hasClass( "disabled" ) ) {
                    var date = new Date( $( this ).data( "date" ) );
                    date.setMinutes( SELF.minute );
                    date.setHours( SELF.hour );
                    console.log( date );
                    SELF.select( date );
                }
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            } );
        }

        this.html.dialog.off( "mousedown" ).on( "mousedown", function ( e ) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        } );
        if ( this.settings.time ) {
            function setTime( e, type, max ) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                var margin = (SELF.html[ type ].width() - SELF.html[ type + "Slider" ].width()) / 2,
                    left   = ((e.touches && e.touches[ 0 ] ? e.touches[ 0 ].pageX : e.pageX) - SELF.html[ type + "Slider" ].offset().left ) / (SELF.html.hour.width() - margin * 2),
                    value  = parseInt( left * max );
                if ( value < 0 ) {
                    value = 0;
                } else if ( value > max - 1 ) {
                    value = max - 1;
                }
                SELF.html[ type + "Cursor" ].css( "left", (SELF.html[ type + "Slider" ].width() / (max - 1) * value) );
                return value;
            }

            this.html.hour.off( "mousedown touchstart" ).on( "mousedown touchstart", function ( e ) {
                var old   = SELF.hour;
                SELF.hour = setTime( e, "hour", 24 );
                SELF.selected.setHours( SELF.hour );
                if ( old !== SELF.hour ) {
                    SELF.select( new Date( SELF.selected ) );
                }
                $( document ).on( "mousemove." + NAME + " touchmove." + NAME, function ( e ) {
                    old       = SELF.hour;
                    SELF.hour = setTime( e, "hour", 24 );
                    SELF.selected.setHours( SELF.hour );
                    if ( old !== SELF.hour ) {
                        SELF.select( new Date( SELF.selected ) );
                    }
                } ).on( "mouseup." + NAME + " touchend." + NAME, function ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    $( document ).off( "." + NAME );
                } )
            } );
            this.html.minute.off( "mousedown touchstart" ).on( "mousedown touchstart", function ( e ) {
                var old     = SELF.minute;
                SELF.minute = setTime( e, "minute", 60 );
                SELF.selected.setMinutes( SELF.minute );
                if ( old !== SELF.minute ) {
                    SELF.select( new Date( SELF.selected ) );
                }
                $( document ).on( "mousemove." + NAME + " touchmove." + NAME, function ( e ) {
                    old         = SELF.minute;
                    SELF.minute = setTime( e, "minute", 60 );
                    SELF.selected.setMinutes( SELF.minute );
                    if ( old !== SELF.minute ) {
                        SELF.select( new Date( SELF.selected ) );
                    }
                } ).on( "mouseup." + NAME + " touchend." + NAME, function ( e ) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    $( document ).off( "." + NAME );
                } )
            } );
        }

        this.html.clear.off( "click" ).on( "click", function () {
            SELF.clear();
        } );

        this.html.dialog.off( "." + this.name ).on( "selectstart." + this.name, function ( event ) {
            "use strict";
            event.preventDefault();
        } );

        this.html.close.off( "click" ).on( "click", function () {
            SELF.close();
        } );

        this.html.title.off( "click" ).on( "click", function () {
            SELF.html.title.toggleClass( NAME + "-year-open" );
        } );

        this.html.today.off( "click" ).on( "click", function () {
            var dis = false;
            if ( SELF.settings.max && SELF.today > SELF.settings.max ) {
                dis = true;
            }
            if ( SELF.settings.min && SELF.today < SELF.settings.min ) {
                dis = true;
            }

            if ( !dis ) {
                var d = new Date( SELF.today );
                d.setHours( SELF.hour );
                d.setMinutes( SELF.minute );
                SELF.select( d );
                SELF.current = SELF.today;
                SELF.close();
            }
        } );

        this.html.next.off( "click" ).on( "click", function () {
            SELF.current = new Date( SELF.current.getFullYear(), SELF.current.getMonth() + 1, 1 );
            SELF.update();
        } );

        this.html.previous.off( "click" ).on( "click", function () {
            SELF.current = new Date( SELF.current.getFullYear(), SELF.current.getMonth() - 1, 1 );
            SELF.update();
        } );

        return this;
    };
    FancyDate.api.select           = function ( date ) {
        var SELF = this;
        if ( (this.settings.min && this.settings.min.getTime() > date.getTime()) || (this.settings.max && this.settings.max.getTime() < date.getTime()) ) {
            SELF.close();
            return;
        }
        SELF.element.val( SELF.encode( date ) );
        SELF.selected = date;
        if ( typeof SELF.settings.onSelect == "function" ) {
            SELF.settings.onSelect( SELF.selected );
        }
        if ( !SELF.settings.time ) {
            SELF.close();
        }
        return this;
    };
    FancyDate.api.encode           = function ( date, format ) {
        var SELF = this;
        format   = format || SELF.settings.format;
        return formatDate( date, format );
    };
    FancyDate.api.decode           = function ( date ) {
        var SELF = this;

        /*var format = SELF.settings.format.split( "" );
        var m      = "", dateFormat = [], gi = 0, custom = false, i = 0;
        for ( i; i < format.length; i++ ) {
            custom = format[ i ] == "'" ? !custom : custom;
            if ( custom ) {if ( format[ i ] != "'" ) {dateFormat[ Math.max( 0, gi - 1 ) ] += format[ i ];} else {dateFormat[ Math.max( 0, gi - 1 ) ] = "";}} else if ( format[ i ] != "'" ) {
                if ( format[ i ] == m ) {dateFormat[ gi - 1 ] += format[ i ];} else {
                    dateFormat[ gi ] = format[ i ];
                    gi++;
                }
                m = format[ i ];
            }
        }
        console.log( dateFormat );

        var date_props = {
            d   : 1,
            dd  : 1,
            EE  : 1,
            EEE : 1,
            EEEE: 1,
            S   : 1,
            w   : 1,
            z   : 1,
            WW  : 1,
            W   : 1,
            M   : 1,
            MM  : 1,
            MMM : 1,
            MMMM: 1,
            n   : 1,
            t   : 1,
            L   : 1,
            yyyy: 1,
            yy  : 1,
            a   : 1,
            A   : 1,
            g   : 1,
            G   : 1,
            h   : 1,
            HH  : 1,
            H   : 1,
            mm  : 1,
            m   : 1,
            ss  : 1,
            s   : ""
        };
        var position   = 0;
        var _date      = {};
        for ( i = 0; i < dateFormat.length; i++ ) {
            var f = dateFormat[ i ];
            if ( f.match( /[a-zA-Z]/g ) && typeof date_props[ f ] != "undefined" ) {
                switch ( f ) {
                    case "d":
                        _date.d = parseInt( date.substring( position ) );
                }
            }
        }

        return date_string;*/

        var format = {
            d: parseInt( date.substring( SELF.settings.format.indexOf( "dd" ), SELF.settings.format.indexOf( "dd" ) + 2 ) ),
            m: parseInt( date.substring( SELF.settings.format.indexOf( "MM" ), SELF.settings.format.indexOf( "MM" ) + 2 ) ) - 1,
            y: parseInt( date.substring( SELF.settings.format.indexOf( "yyyy" ), SELF.settings.format.indexOf( "yyyy" ) + 4 ) ),
            h: 0,
            M: 0
        };
        return new Date( format.y, format.m, format.d );
    };
    FancyDate.api.translate        = function ( key ) {
        var l = FancyDate.translation[ navigator.language ] ? navigator.language : "en",
            t = FancyDate.translation[ l ][ key ];
        return t;
    };
    FancyDate.api.setYear          = function ( year ) {
        this.current.setYear( year );
        this.create();
    };
    FancyDate.api.clear            = function () {
        this.element.val( "" );
        this.selected = null;
        this.current  = this.today;
        if ( typeof this.settings.onSelect == "function" ) {
            this.settings.onSelect( this.selected );
        }
        this.close();
    };
    Fancy.settings[ NAME ]         = {
        format               : "dd.MM.yyyy",
        time                 : true,
        animated             : true,
        onSelect             : function () {},
        onOpen               : function () {},
        onClose              : function () {},
        query                : function () {
            return true;
        },
        current              : false,
        free                 : true,
        showWeekHeader       : true,
        min                  : false,
        max                  : false,
        yearTop              : 20,
        yearBottom           : 50,
        yearStatic           : false,
        checkMinAndMax       : true,
        preventMobileKeyboard: true
    };

    FancyDate.translation       = {
        de: {
            "month.0"     : "Januar",
            "month.1"     : "Februar",
            "month.2"     : "M&auml;rz",
            "month.3"     : "April",
            "month.4"     : "Mai",
            "month.5"     : "Juni",
            "month.6"     : "Juli",
            "month.7"     : "August",
            "month.8"     : "September",
            "month.9"     : "Oktober",
            "month.10"    : "November",
            "month.11"    : "Dezember",
            "day.1"       : "Montag",
            "day.2"       : "Dienstag",
            "day.3"       : "Mittwoch",
            "day.4"       : "Donnerstag",
            "day.5"       : "Freitag",
            "day.6"       : "Samstag",
            "day.7"       : "Sonntag",
            "day.short.1" : "Mo",
            "day.short.2" : "Di",
            "day.short.3" : "Mi",
            "day.short.4" : "Do",
            "day.short.5" : "Fr",
            "day.short.6" : "Sa",
            "day.short.7" : "So",
            "button.close": "Schlie&szlig;en",
            "button.today": "Heute",
            "button.clear": "L&ouml;schen"
        },
        en: {
            "month.0"     : "January",
            "month.1"     : "February",
            "month.2"     : "March",
            "month.3"     : "April",
            "month.4"     : "May",
            "month.5"     : "June",
            "month.6"     : "July",
            "month.7"     : "August",
            "month.8"     : "September",
            "month.9"     : "October",
            "month.10"    : "November",
            "month.11"    : "December",
            "day.1"       : "Monday",
            "day.2"       : "Tuesday",
            "day.3"       : "Wednesday",
            "day.4"       : "Thursday",
            "day.5"       : "Friday",
            "day.6"       : "Saturday",
            "day.7"       : "Sunday",
            "day.short.1" : "Mo",
            "day.short.2" : "Tu",
            "day.short.3" : "We",
            "day.short.4" : "Th",
            "day.short.5" : "Fr",
            "day.short.6" : "Sa",
            "day.short.7" : "Su",
            "button.close": "Close",
            "button.today": "Today",
            "button.clear": "Clear"
        }
    };
    Fancy.date                  = VERSION;
    Fancy.api.date              = function ( settings ) {
        return this.set( NAME, function ( el ) {
            return new FancyDate( el, settings )
        } );
    };
    window.FancyDateTranslation = FancyDate.translation;
})( window, jQuery, Fancy );
