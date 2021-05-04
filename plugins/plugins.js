import Test from './testapi.js';
import Merriam from './merriam.js';

const plugins = {
    "MerriamAPI": Merriam,
    "TestAPI": Test
}

export {
    plugins,
    plugins as default
}
