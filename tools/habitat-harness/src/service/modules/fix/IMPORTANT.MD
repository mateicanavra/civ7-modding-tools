for larger modules, you can have a router/ directory that holds [subrouter].router.ts files that then compose in the router/index.ts as a single module router object (which gets exported)

apply this across the board, as it may help with handling some larger modules. keep in mind that you may need/want to actually rethink some of the modules if you find they try to reach into one another
