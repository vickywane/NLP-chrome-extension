
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/routes/wrapper.svelte generated by Svelte v3.44.1 */

    const file$7 = "src/routes/wrapper.svelte";

    function create_fragment$7(ctx) {
    	let link;
    	let t;
    	let main;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			main = element("main");
    			if (default_slot) default_slot.c();
    			attr_dev(link, "href", "https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file$7, 1, 2, 16);
    			add_location(main, file$7, 7, 0, 130);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Wrapper', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Wrapper> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Wrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrapper",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const appView = writable("TEXTSCREEN");

    const handleAppView = ({ view }) => {
        if (view) {
            appView.update(state => {
                state = view; 

                return state
            });
        }
    };

    /* src/routes/Home.svelte generated by Svelte v3.44.1 */
    const file$6 = "src/routes/Home.svelte";

    // (7:0) <Wrapper>
    function create_default_slot$2(ctx) {
    	let div2;
    	let section0;
    	let p;
    	let t1;
    	let section1;
    	let div0;
    	let button0;
    	let t2;
    	let svg0;
    	let path0;
    	let t3;
    	let br;
    	let t4;
    	let div1;
    	let button1;
    	let t5;
    	let svg1;
    	let path1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			section0 = element("section");
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, illum!";
    			t1 = space();
    			section1 = element("section");
    			div0 = element("div");
    			button0 = element("button");
    			t2 = text("Generate Search Query From Voice Input\n          ");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t3 = space();
    			br = element("br");
    			t4 = space();
    			div1 = element("div");
    			button1 = element("button");
    			t5 = text("Generate Search Query From Text Input\n\n          ");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(p, "class", "text-center");
    			add_location(p, file$6, 9, 6, 198);
    			attr_dev(section0, "class", "my-5");
    			add_location(section0, file$6, 8, 4, 169);
    			attr_dev(path0, "stroke-linecap", "round");
    			attr_dev(path0, "stroke-linejoin", "round");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "d", "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z");
    			add_location(path0, file$6, 28, 12, 755);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "class", "h-5 w-5 ml-2");
    			attr_dev(svg0, "fill", "none");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "stroke", "currentColor");
    			add_location(svg0, file$6, 21, 10, 556);
    			attr_dev(button0, "class", "custom-btn");
    			add_location(button0, file$6, 16, 8, 384);
    			attr_dev(div0, "class", "align-center");
    			add_location(div0, file$6, 15, 6, 349);
    			add_location(br, file$6, 38, 6, 1058);
    			attr_dev(path1, "stroke-linecap", "round");
    			attr_dev(path1, "stroke-linejoin", "round");
    			attr_dev(path1, "stroke-width", "2");
    			attr_dev(path1, "d", "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z");
    			add_location(path1, file$6, 54, 12, 1477);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "class", "h-5 w-5 ml-2");
    			attr_dev(svg1, "fill", "none");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "stroke", "currentColor");
    			add_location(svg1, file$6, 47, 10, 1278);
    			attr_dev(button1, "class", "custom-btn");
    			add_location(button1, file$6, 41, 8, 1107);
    			attr_dev(div1, "class", "align-center");
    			add_location(div1, file$6, 40, 6, 1072);
    			add_location(section1, file$6, 14, 4, 333);
    			add_location(div2, file$6, 7, 2, 159);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, section0);
    			append_dev(section0, p);
    			append_dev(div2, t1);
    			append_dev(div2, section1);
    			append_dev(section1, div0);
    			append_dev(div0, button0);
    			append_dev(button0, t2);
    			append_dev(button0, svg0);
    			append_dev(svg0, path0);
    			append_dev(section1, t3);
    			append_dev(section1, br);
    			append_dev(section1, t4);
    			append_dev(section1, div1);
    			append_dev(div1, button1);
    			append_dev(button1, t5);
    			append_dev(button1, svg1);
    			append_dev(svg1, path1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(7:0) <Wrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let wrapper;
    	let current;

    	wrapper = new Wrapper({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(wrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(wrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const wrapper_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				wrapper_changes.$$scope = { dirty, ctx };
    			}

    			wrapper.$set(wrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleAppView({ view: "VOICESCREEN" });
    	const click_handler_1 = () => handleAppView({ view: "TEXTSCREEN" });
    	$$self.$capture_state = () => ({ Wrapper, handleAppView });
    	return [click_handler, click_handler_1];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const AGENT_URL = 'http://localhost:4040/api/agent';

    const textSearchState = writable("SOKMETHING");
    const searchStatus = writable({
        status: "",
        hasError: false
    });

    const updateSearchStatus = ({ status, hasError }) => {
        searchStatus.update(state => {
            state.hasError = hasError ? hasError : state.hasError;
            state.status = status ? status : state.status;

            return state
        });
    };

    const submitSearchSentence = async sentence => {
        updateSearchStatus({ status: "GENERATING_SEARCH_RESULT" });

        try {
            const req = await fetch(`${AGENT_URL}`, {
                body: { message: sentence }
            });

            const { data } = await req.json();
            console.log(data);
        } catch (e) {
            updateSearchStatus({ hasError: true });
        }

    };

    /* src/routes/text.svelte generated by Svelte v3.44.1 */
    const file$5 = "src/routes/text.svelte";

    // (51:20) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Generate Code Search Query";
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "custom-btn");
    			add_location(button, file$5, 51, 24, 1577);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(51:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (43:20) {#if currentSearchStatus.status === "GENERATING_SEARCH_RESULT"}
    function create_if_block$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Generating Code Search Query";
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "custom-btn");
    			add_location(button, file$5, 43, 24, 1263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(43:20) {#if currentSearchStatus.status === \\\"GENERATING_SEARCH_RESULT\\\"}",
    		ctx
    	});

    	return block;
    }

    // (15:0) <Wrapper>
    function create_default_slot$1(ctx) {
    	let div2;
    	let section0;
    	let p;
    	let t1;
    	let section1;
    	let form;
    	let div0;
    	let input;
    	let t2;
    	let br;
    	let t3;
    	let div1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*currentSearchStatus*/ ctx[1].status === "GENERATING_SEARCH_RESULT") return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			section0 = element("section");
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta,\n                illum!";
    			t1 = space();
    			section1 = element("section");
    			form = element("form");
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(p, "class", "text-center");
    			add_location(p, file$5, 17, 12, 407);
    			attr_dev(section0, "class", "my-5");
    			add_location(section0, file$5, 16, 8, 372);
    			attr_dev(input, "class", "custom-input");
    			attr_dev(input, "placeholder", "Make a search intended sentence");
    			add_location(input, file$5, 33, 20, 868);
    			attr_dev(div0, "class", "align-center");
    			add_location(div0, file$5, 32, 16, 821);
    			add_location(br, file$5, 39, 16, 1104);
    			attr_dev(div1, "class", "align-center");
    			add_location(div1, file$5, 41, 16, 1128);
    			attr_dev(form, "class", "my-5");
    			add_location(form, file$5, 25, 12, 603);
    			add_location(section1, file$5, 24, 8, 581);
    			add_location(div2, file$5, 15, 4, 358);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, section0);
    			append_dev(section0, p);
    			append_dev(div2, t1);
    			append_dev(div2, section1);
    			append_dev(section1, form);
    			append_dev(form, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*searchSentence*/ ctx[0]);
    			append_dev(form, t2);
    			append_dev(form, br);
    			append_dev(form, t3);
    			append_dev(form, div1);
    			if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(form, "submit", /*submit_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*searchSentence*/ 1 && input.value !== /*searchSentence*/ ctx[0]) {
    				set_input_value(input, /*searchSentence*/ ctx[0]);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(15:0) <Wrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let wrapper;
    	let current;

    	wrapper = new Wrapper({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(wrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(wrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const wrapper_changes = {};

    			if (dirty & /*$$scope, searchSentence, currentSearchStatus*/ 19) {
    				wrapper_changes.$$scope = { dirty, ctx };
    			}

    			wrapper.$set(wrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const click_handler = () => {
    	
    };

    const click_handler_1 = () => {
    	
    };

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Text', slots, []);
    	let searchSentence;
    	let currentSearchStatus;
    	searchStatus.subscribe(state => $$invalidate(1, currentSearchStatus = state));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchSentence = this.value;
    		$$invalidate(0, searchSentence);
    	}

    	const submit_handler = e => {
    		submitSearchSentence(searchSentence);
    		e.preventDefault();
    	};

    	$$self.$capture_state = () => ({
    		Wrapper,
    		submitSearchSentence,
    		searchStatus,
    		textSearchState,
    		searchSentence,
    		currentSearchStatus
    	});

    	$$self.$inject_state = $$props => {
    		if ('searchSentence' in $$props) $$invalidate(0, searchSentence = $$props.searchSentence);
    		if ('currentSearchStatus' in $$props) $$invalidate(1, currentSearchStatus = $$props.currentSearchStatus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [searchSentence, currentSearchStatus, input_input_handler, submit_handler];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/generatedQuery.svelte generated by Svelte v3.44.1 */
    const file$4 = "src/components/generatedQuery.svelte";

    // (33:16) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let t;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Copied!\n\n                        ");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4");
    			add_location(path, file$4, 46, 28, 1739);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-5 w-5 ml-2");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$4, 39, 24, 1430);
    			attr_dev(button, "class", "query-btn flex svelte-3myy4f");
    			add_location(button, file$4, 33, 20, 1236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			append_dev(button, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(33:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:16) {#if !copied}
    function create_if_block$2(ctx) {
    	let button;
    	let t;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Copy Search Query\n\n                        ");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3");
    			add_location(path, file$4, 24, 28, 741);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-5 w-5 ml-2");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$4, 17, 24, 432);
    			attr_dev(button, "class", "query-btn flex svelte-3myy4f");
    			add_location(button, file$4, 11, 20, 228);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			append_dev(button, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:16) {#if !copied}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div4;
    	let div3;
    	let div2;
    	let div0;
    	let t0;
    	let br0;
    	let t1;
    	let div1;
    	let code;
    	let t3;
    	let br1;
    	let t4;
    	let p0;
    	let t6;
    	let p1;

    	function select_block_type(ctx, dirty) {
    		if (!/*copied*/ ctx[0]) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			if_block.c();
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			div1 = element("div");
    			code = element("code");
    			code.textContent = "for()";
    			t3 = space();
    			br1 = element("br");
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "Wrong Search Query Generated?";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "Try Query From Search Statement";
    			add_location(div0, file$4, 9, 12, 172);
    			add_location(br0, file$4, 56, 12, 2227);
    			add_location(code, file$4, 58, 16, 2289);
    			attr_dev(div1, "class", "align-center");
    			add_location(div1, file$4, 57, 12, 2246);
    			attr_dev(div2, "class", "search-query-ctn");
    			add_location(div2, file$4, 8, 8, 129);
    			attr_dev(div3, "class", "align-center");
    			add_location(div3, file$4, 7, 4, 94);
    			add_location(br1, file$4, 66, 4, 2465);
    			attr_dev(p0, "class", "text-center info-text");
    			add_location(p0, file$4, 67, 4, 2476);
    			attr_dev(p1, "class", "text-center");
    			add_location(p1, file$4, 68, 4, 2547);
    			add_location(div4, file$4, 6, 0, 84);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			if_block.m(div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, br0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, code);
    			append_dev(div4, t3);
    			append_dev(div4, br1);
    			append_dev(div4, t4);
    			append_dev(div4, p0);
    			append_dev(div4, t6);
    			append_dev(div4, p1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GeneratedQuery', slots, []);
    	let copied = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GeneratedQuery> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, copied = !copied);
    	const click_handler_1 = () => $$invalidate(0, copied = !copied);
    	$$self.$capture_state = () => ({ copied });

    	$$self.$inject_state = $$props => {
    		if ('copied' in $$props) $$invalidate(0, copied = $$props.copied);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [copied, click_handler, click_handler_1];
    }

    class GeneratedQuery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GeneratedQuery",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const recorderBits = [];

    const appState = writable({
        recorderStatus: 'STOPPED',
        recorderInstance: null,
        searchQueryResult: null
    });

    const recorderStatus = writable({ status: "STOPPED", hasError: false });

    const updateRecorderStatus = ({ status, hasError }) => {
        recorderStatus.update(state => {
            state.status = status ? status : state.hasError;
            state.hasError = hasError ? hasError : state.hasError;

            return state
        });
    };

    const startRecorder = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            appState.update(state => {
                const recorderInstance = new MediaRecorder(mediaStream);
                state.recorderInstance = recorderInstance;

                state.recorderInstance.start();
                state.recorderInstance.ondataavailable = (event) => {
                    recorderBits.push(event.data);
                };

                return state
            });

            updateRecorderStatus({ status: "RECORDING" });
        } catch (e) {
            console.log("RECORD ERROR", e);
        }
    };

    const stopRecorder = async () => {
        try {
            const formData = new FormData();

            appState.update(state => {
                state.recorderInstance.stop();

                state.recorderInstance.onstop = async () => {
                    if (state.recorderInstance.state === "inactive") {
                        const recordBlob = new Blob(recorderBits, {
                            type: "audio/mp3",
                        });

                        const inputFile = new File([recordBlob], "input", {
                            type: "audio/ogg; codecs=opus",
                        });

                        formData.append("voiceInput", inputFile);
                    }
                };

                return state
            });

            updateRecorderStatus({ status: "GENERATING_SEARCH_QUERY" });

            appState.update(async (state) => {
                try {
                    const req = await fetch(`${AGENT_URL}/voice-input`, {
                        method: "POST",
                        body: formData
                    });

                    const response = await req.json();
                    state.searchQueryResult = { result: response };
                    updateRecorderStatus({ status: "STOPPED", hasError: false });

                    return state
                } catch (e) {
                    console.log("Error sending recording:", e);

                    updateRecorderStatus({ status: "STOPPED", hasError: true });
                }
            });

        } catch (e) {
            console.log("STOP RECORD ERROR", e);
        }
    };

    /* src/routes/voice.svelte generated by Svelte v3.44.1 */
    const file$3 = "src/routes/voice.svelte";

    // (78:6) {:else}
    function create_else_block(ctx) {
    	let div;
    	let button;
    	let t;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text("Stop Recording Voice Input\n\n            ");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636");
    			add_location(path, file$3, 89, 14, 2532);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-5 w-5 ml-2");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$3, 82, 12, 2319);
    			attr_dev(button, "class", "custom-btn flex");
    			add_location(button, file$3, 79, 10, 2202);
    			attr_dev(div, "class", "align-center");
    			add_location(div, file$3, 78, 8, 2165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t);
    			append_dev(button, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(78:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:67) 
    function create_if_block_2$1(ctx) {
    	let div;
    	let button;
    	let t;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text("Generating Search Query ...\n\n            ");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15");
    			add_location(path, file$3, 68, 14, 1826);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-5 w-5 ml-2");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$3, 61, 12, 1613);
    			attr_dev(button, "class", "custom-btn");
    			button.disabled = true;
    			add_location(button, file$3, 58, 10, 1523);
    			attr_dev(div, "class", "align-center");
    			add_location(div, file$3, 57, 8, 1486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t);
    			append_dev(button, svg);
    			append_dev(svg, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(57:67) ",
    		ctx
    	});

    	return block;
    }

    // (36:6) {#if recorderState.status === "STOPPED"}
    function create_if_block_1$1(ctx) {
    	let div;
    	let button;
    	let t;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text("Record Voice Input\n\n            ");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z");
    			add_location(path, file$3, 47, 14, 1098);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-5 w-5 ml-2");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$3, 40, 12, 885);
    			attr_dev(button, "class", "custom-btn flex");
    			add_location(button, file$3, 37, 10, 775);
    			attr_dev(div, "class", "align-center");
    			add_location(div, file$3, 36, 8, 738);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t);
    			append_dev(button, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(36:6) {#if recorderState.status === \\\"STOPPED\\\"}",
    		ctx
    	});

    	return block;
    }

    // (101:6) {#if recorderState.hasError === "ERROR_GENERATING"}
    function create_if_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Error Generating Code Search Query";
    			attr_dev(p, "class", "error-text");
    			add_location(p, file$3, 101, 8, 2915);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(101:6) {#if recorderState.hasError === \\\"ERROR_GENERATING\\\"}",
    		ctx
    	});

    	return block;
    }

    // (23:0) <Wrapper>
    function create_default_slot(ctx) {
    	let section0;
    	let p;
    	let t1;
    	let section1;
    	let generatedquery;
    	let t2;
    	let section2;
    	let div;
    	let t3;
    	let current;
    	generatedquery = new GeneratedQuery({ $$inline: true });

    	function select_block_type(ctx, dirty) {
    		if (/*recorderState*/ ctx[0].status === "STOPPED") return create_if_block_1$1;
    		if (/*recorderState*/ ctx[0].status === "GENERATING_SEARCH_QUERY") return create_if_block_2$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*recorderState*/ ctx[0].hasError === "ERROR_GENERATING" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Soluta, illum!";
    			t1 = space();
    			section1 = element("section");
    			create_component(generatedquery.$$.fragment);
    			t2 = space();
    			section2 = element("section");
    			div = element("div");
    			if_block0.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(p, "class", "text-center");
    			add_location(p, file$3, 24, 4, 474);
    			attr_dev(section0, "class", "my-5");
    			add_location(section0, file$3, 23, 2, 446);
    			add_location(section1, file$3, 29, 2, 601);
    			attr_dev(div, "class", "my-2");
    			add_location(div, file$3, 34, 4, 664);
    			add_location(section2, file$3, 33, 2, 650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, p);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section1, anchor);
    			mount_component(generatedquery, section1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div);
    			if_block0.m(div, null);
    			append_dev(div, t3);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t3);
    				}
    			}

    			if (/*recorderState*/ ctx[0].hasError === "ERROR_GENERATING") {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(generatedquery.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(generatedquery.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section1);
    			destroy_component(generatedquery);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(section2);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(23:0) <Wrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let wrapper;
    	let current;

    	wrapper = new Wrapper({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(wrapper.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(wrapper, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const wrapper_changes = {};

    			if (dirty & /*$$scope, recorderState*/ 17) {
    				wrapper_changes.$$scope = { dirty, ctx };
    			}

    			wrapper.$set(wrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wrapper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wrapper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wrapper, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Voice', slots, []);
    	let state;
    	let recorderState;

    	appState.subscribe(value => {
    		state = value;
    	});

    	recorderStatus.subscribe(status => $$invalidate(0, recorderState = status));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Voice> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => startRecorder();
    	const click_handler_1 = () => stopRecorder();

    	$$self.$capture_state = () => ({
    		Wrapper,
    		GeneratedQuery,
    		appState,
    		startRecorder,
    		stopRecorder,
    		recorderStatus,
    		state,
    		recorderState
    	});

    	$$self.$inject_state = $$props => {
    		if ('state' in $$props) state = $$props.state;
    		if ('recorderState' in $$props) $$invalidate(0, recorderState = $$props.recorderState);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [recorderState, click_handler, click_handler_1];
    }

    class Voice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Voice",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.44.1 */
    const file$2 = "src/components/Nav.svelte";

    function create_fragment$2(ctx) {
    	let nav;
    	let div0;
    	let p;
    	let t1;
    	let div1;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Sourcegraph NLP";
    			t1 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(p, "class", "title");
    			add_location(p, file$2, 7, 8, 211);
    			attr_dev(div0, "class", "hover-btn");
    			add_location(div0, file$2, 6, 4, 124);
    			attr_dev(path, "stroke-linecap", "round");
    			attr_dev(path, "stroke-linejoin", "round");
    			attr_dev(path, "stroke-width", "2");
    			attr_dev(path, "d", "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z");
    			add_location(path, file$2, 18, 12, 488);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "h-6 w-6");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "stroke", "currentColor");
    			add_location(svg, file$2, 11, 8, 296);
    			attr_dev(div1, "class", "hover-btn");
    			add_location(div1, file$2, 10, 4, 264);
    			add_location(nav, file$2, 5, 0, 114);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, p);
    			append_dev(nav, t1);
    			append_dev(nav, div1);
    			append_dev(div1, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleAppView({ view: "HOMESCREEN" });
    	$$self.$capture_state = () => ({ handleAppView });
    	return [click_handler];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.44.1 */
    const file$1 = "src/components/Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let div;
    	let p;
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			p = element("p");
    			t0 = text("Read The ");
    			a = element("a");
    			a.textContent = "Terms Of Use";
    			attr_dev(a, "href", "https://github.com");
    			attr_dev(a, "class", "svelte-tkew");
    			add_location(a, file$1, 7, 21, 131);
    			attr_dev(p, "class", "text-center");
    			add_location(p, file$1, 6, 8, 86);
    			add_location(div, file$1, 5, 4, 72);
    			add_location(footer, file$1, 4, 0, 59);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.1 */
    const file = "src/App.svelte";

    // (23:37) 
    function create_if_block_2(ctx) {
    	let voice;
    	let current;
    	voice = new Voice({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(voice.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(voice, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voice.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voice.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(voice, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(23:37) ",
    		ctx
    	});

    	return block;
    }

    // (21:36) 
    function create_if_block_1(ctx) {
    	let text_1;
    	let current;
    	text_1 = new Text({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(21:36) ",
    		ctx
    	});

    	return block;
    }

    // (19:4) {#if view === "HOMESCREEN"}
    function create_if_block(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(19:4) {#if view === \\\"HOMESCREEN\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let nav;
    	let t0;
    	let div0;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let footer;
    	let current;
    	nav = new Nav({ $$inline: true });
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*view*/ ctx[0] === "HOMESCREEN") return 0;
    		if (/*view*/ ctx[0] === "TEXTSCREEN") return 1;
    		if (/*view*/ ctx[0] === "VOICESCREEN") return 2;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(nav.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			add_location(div0, file, 17, 2, 413);
    			attr_dev(div1, "class", "container svelte-1pl4p1n");
    			add_location(div1, file, 15, 0, 376);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(nav, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div0, null);
    			}

    			append_dev(div1, t1);
    			mount_component(footer, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(nav);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let view;

    	appView.subscribe(currentView => {
    		$$invalidate(0, view = currentView);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Home,
    		Text,
    		Voice,
    		appView,
    		Nav,
    		Footer,
    		view
    	});

    	$$self.$inject_state = $$props => {
    		if ('view' in $$props) $$invalidate(0, view = $$props.view);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [view];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
