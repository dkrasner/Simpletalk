import PartView from './PartView.js';

const linkIcon = `
<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-link" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
  <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
</svg>
`;

const templateString = `
  <style>
  :host {
    box-sizing: border-box;
    display: block;
    position: absolute;
    padding: 1px;
    user-select: none;
    cursor: pointer;
  }
  slot {
    width: 100%;
    height: 100%;
  }
  ::slotted(*) {
    width: 100%;
    height: 100%;
  }
  </style>
  <slot name="content"></slot>
  `;


class BrowserView extends PartView {
    constructor() {
        super();

        // Setup template and shadow dom
        this.template = document.createElement('template');
        this.template.innerHTML = templateString;
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._shadowRoot.appendChild(this.template.content.cloneNode(true));

        // Bind component methods
        this.onClick = this.onClick.bind(this);
        this.setSRC = this.setSRC.bind(this);
        this.setHTML = this.setHTML.bind(this);
        this.initCustomHaloButton = this.initCustomHaloButton.bind(this);
        this.updateBrowserLink = this.updateBrowserLink.bind(this);
        this.handleShadowMessage = this.handleShadowMessage.bind(this)
    }

    afterConnected() {
        if (!this.haloButton) {
            this.initCustomHaloButton();
        }
        this.addEventListener("messageBrowser", this.handleShadowMessage);
    }

    afterDisconnected() {
        this.removeEventListener("messageBrowser", this.handleShadowMessage);
    }

    afterModelSet() {
        const src = this.model.partProperties.getPropertyNamed(this.model, "src");
        const html = this.model.partProperties.getPropertyNamed(this.model, "content");
        if (src) {
            this.setSRC(src);
        } else if (html) {
            this.setHTML(html);
        }
        this.onPropChange("src", (url) => {
            if (url) {
                try {
                    // resource load is auto-loaded by the <browser> element
                    this.setSRC(url);
                    // if successful set the content property to null
                    this.model.partProperties.setPropertyNamed(
                        this.model,
                        "content",
                        null,
                        false // do not notify, to avoid an infinite loop
                    );
                } catch (error) {
                    let errorMsg = {
                        type: "error",
                        name: "ResourceNotFound",
                        resourceType: "browser",
                        partId: this.model.id,
                        details: { source: url, type: "url" }

                    };
                    this.model.sendMessage({ errorMsg }, this.model);
                }
            }
        });

        this.onPropChange("content", (html) => {
            try {
                this.setHTML(html);
                // if successful set the src property to nul
                this.model.partProperties.setPropertyNamed(
                    this.model,
                    "src",
                    null,
                    false // do not notify, to avoid an infinite loop
                );
            } catch (error) {
                let errorMsg = {
                    type: "error",
                    name: "ResourceNotValid",
                    resourceType: "browser",
                    partId: this.model.id,
                };
                this.model.sendMessage({ errorMsg }, this.model);
            }
        });
    }

    setSRC(src) {
        const iframe = document.createElement("iframe");
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowFullScreen", true);
        iframe.setAttribute("slot", "content");
        iframe.src = src;
        // if there is something slotted remove it first
        this.querySelectorAll("[slot='content']").forEach((node) => node.remove());
        this.append(iframe);
    }

    setHTML(html){
        let content = document.createElement("div");
        content.innerHTML = html;
        content = content.firstChild;
        content.setAttribute("slot", "content");
        // if there is something slotted remove it first
        this.querySelectorAll("[slot='content']").forEach((node) => node.remove());
        this.append(content);
    }

    handleShadowMessage(event) {
        const msg = event.detail.message;
        this.model.sendMessage(msg, this.model);
    }

    onClick(event) {
        if (event.button == 0) {
            if (event.shiftKey) {
                // prevent triggering the on click message
                event.preventDefault();
                if (this.hasOpenHalo) {
                    this.model.partProperties.setPropertyNamed(this.model, "halo-open", false);
                } else {
                    this.model.partProperties.setPropertyNamed(this.model, "halo-open", true);
                }
            } else if (!this.hasOpenHalo) {
                // Send the click command message to self
                this.model.sendMessage({
                    type: 'command',
                    commandName: 'click',
                    args: [],
                    shouldIgnore: true // Should ignore if System DNU
                }, this.model);
            }
        }
    }

    openHalo() {
        // Override default. Here we add a custom button
        // when showing.
        let foundHalo = this.shadowRoot.querySelector('st-halo');
        if (!foundHalo) {
            foundHalo = document.createElement('st-halo');
            this.shadowRoot.appendChild(foundHalo);
        }
        foundHalo.append(this.haloButton);
    }

    initCustomHaloButton() {
        this.haloButton = document.createElement('div');
        this.haloButton.id = 'halo-browser-link';
        this.haloButton.classList.add('halo-button');
        this.haloButton.innerHTML = linkIcon;
        this.haloButton.style.marginTop = "6px";
        this.haloButton.setAttribute('slot', 'right-column');
        this.haloButton.setAttribute('title', 'Edit link for browser source');
        this.haloButton.addEventListener('click', this.updateBrowserLink);
    }

    updateBrowserLink(event) {
        // Tells the model to update its
        // src link for the browser
        let currentSrc = this.model.partProperties.getPropertyNamed(
            this.model,
            'src'
        );
        let result = window.prompt("Edit URL for browser:", currentSrc);
        if (result && result !== '' && result !== currentSrc) {
            this.sendMessage(
                {
                    type: 'command',
                    commandName: 'setURLTo',
                    args: [result]
                },
                this.model
            );
        }
    }
}

export {
    BrowserView,
    BrowserView as default
};
