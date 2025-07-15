document.addEventListener('DOMContentLoaded', () => {
    const fileInputTrigger = document.getElementById('fileInputTrigger');
    const glbFileInput = document.getElementById('glbFileInput');
    const panelHeaders = document.querySelectorAll('.editor-panel .panel-section .panel-header');
    const uploadArea = document.getElementById('uploadArea');
    const modelViewerContainer = document.getElementById('modelViewerContainer');
    const filePathDisplay = document.getElementById('filePathDisplay');
    const generatePosterBtn = document.getElementById('generatePosterBtn');
    const posterPreview = document.getElementById('posterPreview');
    const savePublishBtn = document.querySelector('.save-publish-btn');
    const panelTabsContainer = document.querySelector('.panel-tabs');
    const panelTabBtns = document.querySelectorAll('.panel-tab-btn');
    const panelTabContents = document.querySelectorAll('.panel-tab-content');

    // Input fields for Orbit controls
    const orbitCenterXInput = document.getElementById('orbit-center-x');
    const orbitCenterYInput = document.getElementById('orbit-center-y');
    const orbitCenterZInput = document.getElementById('orbit-center-z');
    const cameraYawInput = document.getElementById('camera-yaw');
    const cameraPitchInput = document.getElementById('camera-pitch');

    // Input fields for Lighting controls
    const envImageSelect = document.getElementById('env-image'); // Placeholder, actual HDRs loaded via file input
    const hdrBtn = document.querySelector('.hdr-btn');
    const exposureRange = document.getElementById('exposure');
    const exposureValueInput = document.getElementById('exposure-value');
    const skyboxEnvCheckbox = document.getElementById('skybox-env');
    const bgColorPicker = document.getElementById('bg-color');
    const transparentBgBtn = document.querySelector('.transparent-btn');
    const shadowIntensityRange = document.getElementById('shadow-intensity');
    const shadowIntensityValueInput = document.getElementById('shadow-intensity-value');
    const shadowSoftnessRange = document.getElementById('shadow-softness');
    const shadowSoftnessValueInput = document.getElementById('shadow-softness-value');

    // Theme Switcher Elements
    const themeSwitcherBtn = document.getElementById('themeSwitcherBtn');
    const bodyElement = document.body;

    // Footer warning elements
    const footerLoadModelSpan = document.getElementById('footer-load-model');
    const footerSetNameSpan = document.getElementById('footer-set-name'); // Re-evaluate its use
    const footerCreatePosterSpan = document.getElementById('footer-create-poster');

    // Material Tab DOM Elements
    const materialSelect = document.getElementById('materialSelect');
    const baseColorFactorInput = document.getElementById('baseColorFactor');
    const baseColorTexturePreview = document.getElementById('baseColorTexturePreview');
    const metallicFactorRange = document.getElementById('metallicFactorRange');
    const metallicFactorValue = document.getElementById('metallicFactorValue');
    const roughnessFactorRange = document.getElementById('roughnessFactorRange');
    const roughnessFactorValue = document.getElementById('roughnessFactorValue');
    const metallicRoughnessTexturePreview = document.getElementById('metallicRoughnessTexturePreview');
    const normalTexturePreview = document.getElementById('normalTexturePreview');
    const emissiveFactorInput = document.getElementById('emissiveFactor');
    const emissiveTexturePreview = document.getElementById('emissiveTexturePreview');
    const occlusionTexturePreview = document.getElementById('occlusionTexturePreview');
    const alphaFactorRange = document.getElementById('alphaFactorRange');
    const alphaFactorValue = document.getElementById('alphaFactorValue');
    const doubleSidedCheckbox = document.getElementById('doubleSided');
    const alphaBlendModeSelect = document.getElementById('alphaBlendMode');
    const alphaCutoffInput = document.getElementById('alphaCutoff');
    const materialResetButtons = document.querySelectorAll('#tab-material .reset-btn');

    // Hotspot Tab DOM Elements
    const addHotspotBtn = document.getElementById('addHotspotBtn');
    const selectedHotspotControlsSection = document.getElementById('selectedHotspotControls');
    const hotspotTitleInput = document.getElementById('hotspotTitle');
    const hotspotTextInput = document.getElementById('hotspotText');
    const hotspotLinkInput = document.getElementById('hotspotLink');
    const hotspotLinkLabelInput = document.getElementById('hotspotLinkLabel');
    const hotspotPlacementGrid = document.getElementById('hotspotPlacementGrid');
    const hotspotOpenOnLoadCheckbox = document.getElementById('hotspotOpenOnLoad');
    const repositionHotspotBtn = document.getElementById('repositionHotspotBtn');
    const deleteHotspotBtn = document.getElementById('deleteHotspotBtn');

    // Resizer Elements
    const editorPanelResizer = document.getElementById('editorPanelResizer');
    const editorPanel = document.querySelector('.editor-panel');
    const threeDViewArea = document.getElementById('threeDViewArea');

    // Dimensions Tab DOM Elements
    const dimensionXSpan = document.getElementById('dimensionX');
    const dimensionYSpan = document.getElementById('dimensionY');
    const dimensionZSpan = document.getElementById('dimensionZ');
    const scaleInput = document.getElementById('scaleInput');
    const applyScaleBtn = document.getElementById('applyScaleBtn');
    const resetScaleBtn = document.getElementById('resetScaleBtn');

    let modelViewerElement = null; // To store the dynamically created model-viewer
    let currentModelName = '';
    let posterGenerated = false;
    let hotspotsArray = [];
    let currentHotspotIndex = -1; // -1 means no hotspot is selected or being edited
    let isPlacingHotspot = false;
    let isRepositioningHotspot = false; // New state for repositioning
    let currentModelScale = { x: 1, y: 1, z: 1 }; // To store current scale
    let currentHDRName = null; // Added for storing HDR name
    let currentGlbFile = null; // New: To store the loaded GLB File object

    // --- Initial State Updates ---
    updateFooterWarnings();

    // 1. Make 'click here' link trigger the hidden file input
    if (fileInputTrigger && glbFileInput) {
        fileInputTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            glbFileInput.click();
        });
    }

    // Handle file selection from input
    if (glbFileInput) {
        glbFileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });
    }

    // 2. Make panel section headers toggle their content
    panelHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const panelSection = header.closest('.panel-section');
            if (panelSection) {
                panelSection.classList.toggle('open');
            }
        });
    });

    // 3. Tab switching logic for the editor panel
    if (panelTabsContainer) {
        panelTabsContainer.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.panel-tab-btn');
            if (!targetButton) return;

            const tabToShow = targetButton.dataset.tab;

            panelTabBtns.forEach(btn => btn.classList.remove('active'));
            targetButton.classList.add('active');

            panelTabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabToShow}`) {
                    content.classList.add('active');
                }
            });
        });
    }

    // 4. Drag and drop GLB/HDR functionality
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
            uploadArea.style.borderColor = 'var(--primary-accent)'; // Highlight effect
        });

        uploadArea.addEventListener('dragleave', (event) => {
            event.preventDefault();
            event.stopPropagation();
            uploadArea.style.borderColor = 'var(--dropzone-border-color)'; // Reset highlight
        });

        uploadArea.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            uploadArea.style.borderColor = 'var(--dropzone-border-color)'; // Reset highlight
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });
    }

    function handleFile(file) {
        if (!file) return;
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();

        if (fileExtension === 'glb') {
            currentGlbFile = file; // Store the GLB file object
            currentModelName = fileName;
            const objectURL = URL.createObjectURL(file);
            
            if (modelViewerElement) {
                modelViewerElement.remove(); // Remove previous model if any
            }
            
            modelViewerElement = document.createElement('model-viewer');
            modelViewerElement.setAttribute('src', objectURL);
            modelViewerElement.setAttribute('ar', '');
            modelViewerElement.setAttribute('camera-controls', '');
            // modelViewerElement.setAttribute('auto-rotate', ''); // Optional
            modelViewerElement.setAttribute('shadow-intensity', '1');
            modelViewerElement.setAttribute('exposure', '1');
            modelViewerElement.setAttribute('interaction-prompt', 'auto');
            modelViewerElement.style.width = '100%';
            modelViewerElement.style.height = '100%';
            
            modelViewerContainer.innerHTML = ''; // Clear previous content
            modelViewerContainer.appendChild(modelViewerElement);

            modelViewerElement.addEventListener('load', () => {
                console.log('Model-viewer LOADED event fired.');
                
                // Get and display dimensions
                updateDimensionDisplay();

                // Get current scale and set input
                updateScaleInput();

                // Enable scale input and apply button
                if(scaleInput) scaleInput.disabled = false;
                if(applyScaleBtn) applyScaleBtn.disabled = true; 
                if(resetScaleBtn) resetScaleBtn.disabled = false;

                // Initialize UI controls with model's current values
                // Camera Orbit
                if (modelViewerElement.cameraOrbit) {
                    const orbitParts = modelViewerElement.cameraOrbit.split(' ');
                    if (cameraYawInput && orbitParts[0]) cameraYawInput.value = parseFloat(orbitParts[0]);
                    if (cameraPitchInput && orbitParts[1]) cameraPitchInput.value = parseFloat(orbitParts[1]);
                    // Zoom is part 3 (e.g., '1.5m' or 'auto'), handled by camera-controls or auto for now
                }

                // Lighting - Exposure
                if (exposureRange) exposureRange.value = modelViewerElement.exposure;
                if (exposureValueInput) exposureValueInput.value = modelViewerElement.exposure;

                // Lighting - Skybox
                if (skyboxEnvCheckbox) skyboxEnvCheckbox.checked = !!modelViewerElement.skyboxImage;

                // Lighting - Background Color
                if (bgColorPicker) {
                    // model-viewer background default is transparent, which is not a valid hex for input type=color
                    // If it's transparent or not set, default picker to white.
                    let currentBgColor = modelViewerElement.style.backgroundColor;
                    if (!currentBgColor || currentBgColor === 'transparent') {
                        bgColorPicker.value = '#FFFFFF'; 
                    } else {
                        // Attempt to convert if it's rgb() e.g. from saved state
                        if (currentBgColor.startsWith('rgb')) {
                            try {
                                const rgbValues = currentBgColor.match(/\d+/g).map(Number);
                                bgColorPicker.value = `#${rgbValues[0].toString(16).padStart(2, '0')}${rgbValues[1].toString(16).padStart(2, '0')}${rgbValues[2].toString(16).padStart(2, '0')}`;
                            } catch (e) { bgColorPicker.value = '#FFFFFF'; }
                        } else {
                           bgColorPicker.value = currentBgColor;
                        }
                    }
                }
                
                // Lighting - Shadows
                if (shadowIntensityRange) shadowIntensityRange.value = modelViewerElement.shadowIntensity;
                if (shadowIntensityValueInput) shadowIntensityValueInput.value = modelViewerElement.shadowIntensity;
                if (shadowSoftnessRange) shadowSoftnessRange.value = modelViewerElement.shadowSoftness;
                if (shadowSoftnessValueInput) shadowSoftnessValueInput.value = modelViewerElement.shadowSoftness;

                // Populate material select dropdown
                populateMaterialSelect();
                // Setup hotspot listener AFTER model is loaded
                setupModelViewerEventListeners(); 

            }, { once: true }); // Ensure listener runs only once per model load

            modelViewerContainer.style.display = 'flex'; // Show model viewer container
            uploadArea.classList.remove('active');

            if (filePathDisplay) {
                // For now, just display file name. Path will be more complex.
                filePathDisplay.textContent = fileName; 
            }
            if (generatePosterBtn) {
                generatePosterBtn.disabled = false;
            }
            posterGenerated = false; // Reset poster status when new model is loaded
            // Clear previous poster preview
            if (posterPreview) {
                posterPreview.innerHTML = '<span class="poster-icon-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></span><span>No poster</span>';
            }
            currentHDRName = null; // Reset HDR name when new GLB is loaded

            // Populate material select dropdown
            populateMaterialSelect();

            setupModelViewerEventListeners(); // Setup listener AFTER model-viewer is in DOM

        } else if (fileExtension === 'hdr') {
            if (modelViewerElement) {
                const objectURL = URL.createObjectURL(file);
                modelViewerElement.setAttribute('environment-image', objectURL);
                currentHDRName = fileName; // Store HDR name
                if (skyboxEnvCheckbox && skyboxEnvCheckbox.checked) { 
                    modelViewerElement.skyboxImage = modelViewerElement.environmentImage;
                }
                console.log(`HDR file ${fileName} loaded as environment image.`);
            } else {
                alert('Please load a GLB model first before applying an HDR environment.');
            }
        } else {
            alert('Unsupported file type. Please upload a .glb or .hdr file.');
        }
        updateFooterWarnings();
    }

    // 5. Poster generation logic
    if (generatePosterBtn && posterPreview) {
        generatePosterBtn.addEventListener('click', async () => {
            if (!modelViewerElement || !modelViewerElement.loaded) {
                alert('Model not loaded yet or still loading.');
                return;
            }
            try {
                const dataURL = await modelViewerElement.toDataURL();
                const img = document.createElement('img');
                img.src = dataURL;
                img.alt = 'Model poster';
                posterPreview.innerHTML = ''; // Clear placeholder
                posterPreview.appendChild(img);
                generatePosterBtn.textContent = 'REGENERATE POSTER';
                posterGenerated = true;
            } catch (error) {
                console.error('Error generating poster:', error);
                alert('Could not generate poster. See console for details.');
                posterGenerated = false;
            }
            updateFooterWarnings();
        });
    }
    
    // --- Footer Warning Logic ---
    function updateFooterWarnings() {
        // Model loaded check
        if (modelViewerElement && currentModelName) {
            footerLoadModelSpan.style.display = 'none';
        } else {
            footerLoadModelSpan.style.display = 'block';
        }

        // Project name check (simplified: model name means project name is set for now)
        if (currentModelName) {
            footerSetNameSpan.style.display = 'none';
        } else {
            footerSetNameSpan.style.display = 'block';
        }

        // Poster created check
        if (posterGenerated) {
            footerCreatePosterSpan.style.display = 'none';
        } else {
            footerCreatePosterSpan.style.display = 'block';
        }

        // Enable/Disable Save button
        if (modelViewerElement && currentModelName && posterGenerated) {
            savePublishBtn.disabled = false;
        } else {
            savePublishBtn.disabled = true;
        }
    }

    // --- Sync Orbit Center Inputs with model-viewer --- 
    function updateCameraTarget() {
        if (modelViewerElement && orbitCenterXInput && orbitCenterYInput && orbitCenterZInput) {
            const x = orbitCenterXInput.value;
            const y = orbitCenterYInput.value;
            const z = orbitCenterZInput.value;
            modelViewerElement.cameraTarget = `${x}m ${y}m ${z}m`;
        }
    }

    [orbitCenterXInput, orbitCenterYInput, orbitCenterZInput].forEach(input => {
        if (input) {
            input.addEventListener('input', updateCameraTarget);
        }
    });

    // --- Sync Camera Orbit (Yaw/Pitch) Inputs with model-viewer ---
    function updateCameraOrbit() {
        if (modelViewerElement && cameraYawInput && cameraPitchInput) {
            const yaw = cameraYawInput.value;
            const pitch = cameraPitchInput.value;
            // Assuming zoom is controlled by camera-controls for now, or use a default/previous value if needed.
            // modelViewerElement.cameraOrbit = `${yaw}deg ${pitch}deg ${modelViewerElement.cameraOrbit.split(' ')[2] || '100%'}`;
            // For simplicity, let's just set yaw and pitch. The model-viewer might auto-adjust zoom or keep its current.
            modelViewerElement.cameraOrbit = `${yaw}deg ${pitch}deg auto`; 
        }
    }

    [cameraYawInput, cameraPitchInput].forEach(input => {
        if (input) {
            input.addEventListener('input', updateCameraOrbit);
        }
    });

    // --- Sync Lighting Tab Controls with model-viewer ---

    // HDR Button to trigger file input specifically for HDR
    if (hdrBtn && glbFileInput) {
        hdrBtn.addEventListener('click', () => {
            glbFileInput.accept = '.hdr'; // Temporarily change accept for HDR only
            glbFileInput.click();
            // Reset accept attribute after a short delay or on file input change
            setTimeout(() => { glbFileInput.accept = '.glb,.hdr'; }, 100);
        });
    }
    // Note: Actual environment-image setting is handled in handleFile() for .hdr files
    // The envImageSelect might be populated later with preset HDR options.

    // Exposure
    function syncExposure(sourceElement) {
        if (!modelViewerElement) return;
        let value = '1'; // Default exposure
        if (sourceElement === exposureRange) {
            value = exposureRange.value;
            exposureValueInput.value = value;
        } else if (sourceElement === exposureValueInput) {
            value = exposureValueInput.value;
            exposureRange.value = value;
        }
        modelViewerElement.exposure = value;
    }
    if (exposureRange) exposureRange.addEventListener('input', () => syncExposure(exposureRange));
    if (exposureValueInput) exposureValueInput.addEventListener('input', () => syncExposure(exposureValueInput));

    // Background - Skybox
    if (skyboxEnvCheckbox) {
        skyboxEnvCheckbox.addEventListener('change', () => {
            if (modelViewerElement) {
                if (skyboxEnvCheckbox.checked) {
                    modelViewerElement.skyboxImage = modelViewerElement.environmentImage || '';
                } else {
                    modelViewerElement.skyboxImage = '';
                }
            }
        });
    }

    // Background - Color
    if (bgColorPicker) {
        bgColorPicker.addEventListener('input', () => {
            if (modelViewerElement) {
                modelViewerElement.style.backgroundColor = bgColorPicker.value;
                // If color is set, uncheck skybox if it was used for background
                // This behavior might need refinement based on desired UX
                if (skyboxEnvCheckbox && skyboxEnvCheckbox.checked && modelViewerElement.skyboxImage !== modelViewerElement.environmentImage) {
                   // skyboxEnvCheckbox.checked = false; 
                }
            }
        });
    }
    if (transparentBgBtn) {
        transparentBgBtn.addEventListener('click', () => {
            if (modelViewerElement) {
                modelViewerElement.style.backgroundColor = 'transparent';
                bgColorPicker.value = '#FFFFFF'; // Reset color picker visually if needed
            }
        });
    }

    // Shadow Intensity
    function syncShadowIntensity(sourceElement) {
        if (!modelViewerElement) return;
        let value = '0'; // Default shadow intensity
        if (sourceElement === shadowIntensityRange) {
            value = shadowIntensityRange.value;
            shadowIntensityValueInput.value = value;
        } else if (sourceElement === shadowIntensityValueInput) {
            value = shadowIntensityValueInput.value;
            shadowIntensityRange.value = value;
        }
        modelViewerElement.shadowIntensity = value;
    }
    if (shadowIntensityRange) shadowIntensityRange.addEventListener('input', () => syncShadowIntensity(shadowIntensityRange));
    if (shadowIntensityValueInput) shadowIntensityValueInput.addEventListener('input', () => syncShadowIntensity(shadowIntensityValueInput));

    // Shadow Softness
    function syncShadowSoftness(sourceElement) {
        if (!modelViewerElement) return;
        let value = '1'; // Default shadow softness
        if (sourceElement === shadowSoftnessRange) {
            value = shadowSoftnessRange.value;
            shadowSoftnessValueInput.value = value;
        } else if (sourceElement === shadowSoftnessValueInput) {
            value = shadowSoftnessValueInput.value;
            shadowSoftnessRange.value = value;
        }
        modelViewerElement.shadowSoftness = value;
    }
    if (shadowSoftnessRange) shadowSoftnessRange.addEventListener('input', () => syncShadowSoftness(shadowSoftnessRange));
    if (shadowSoftnessValueInput) shadowSoftnessValueInput.addEventListener('input', () => syncShadowSoftness(shadowSoftnessValueInput));

    // --- Theme Switcher Logic ---
    function applyTheme(theme) {
        if (theme === 'light') {
            bodyElement.classList.add('light-theme');
            bodyElement.classList.remove('dark-theme');
            if (themeSwitcherBtn) {
                themeSwitcherBtn.querySelector('.icon-moon').style.display = 'none';
                themeSwitcherBtn.querySelector('.icon-sun').style.display = 'inline-block';
            }
        } else {
            bodyElement.classList.add('dark-theme');
            bodyElement.classList.remove('light-theme');
            if (themeSwitcherBtn) {
                themeSwitcherBtn.querySelector('.icon-sun').style.display = 'none';
                themeSwitcherBtn.querySelector('.icon-moon').style.display = 'inline-block';
            }
        }
    }

    if (themeSwitcherBtn) {
        themeSwitcherBtn.addEventListener('click', () => {
            let currentTheme = localStorage.getItem('theme') || (bodyElement.classList.contains('dark-theme') ? 'dark' : 'light');
            if (bodyElement.classList.contains('light-theme')) {
                currentTheme = 'dark';
            } else {
                currentTheme = 'light';
            }
            localStorage.setItem('theme', currentTheme);
            applyTheme(currentTheme);
        });
    }

    // Load saved theme on initial page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Default to dark theme if no preference is saved and body has dark-theme class by default
        // Or apply based on system preference if desired (needs more complex logic)
        if (bodyElement.classList.contains('dark-theme')) {
             applyTheme('dark'); // Ensure icons are correct for default dark theme
        } else {
            applyTheme('light'); // Or if default is light
        }
    }

    // --- Material Tab Logic ---
    function populateMaterialSelect() {
        if (!modelViewerElement || !modelViewerElement.model || !materialSelect) return;

        materialSelect.innerHTML = ''; // Clear existing options

        // Add options for each material
        modelViewerElement.model.materials.forEach((material, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = material.name || `Material ${index + 1}`;
            materialSelect.appendChild(option);
        });

        // Select the first material by default or the previously selected one
        materialSelect.value = currentMaterialIndex.toString();
        displayMaterialProperties(getSelectedMaterial()); // Display properties for the default selected material
    }

    // Handle material selection change
    function handleMaterialSelectionChange() {
        currentMaterialIndex = parseInt(materialSelect.value, 10);
        const material = getSelectedMaterial();
        if (material) {
            displayMaterialProperties(material);
        }
    }
    if (materialSelect) materialSelect.addEventListener('change', handleMaterialSelectionChange);


    // Function to display material properties in the UI
    function displayMaterialProperties(material) {
        if (!material) return;

        // Base Color Factor
        const baseColor = material.pbrMetallicRoughness.baseColorFactor;
        if (baseColorFactorInput && baseColor) {
            const hex = `#${Math.round(baseColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(baseColor[1] * 255).toString(16).padStart(2, '0')}${Math.round(baseColor[2] * 255).toString(16).padStart(2, '0')}`;
            baseColorFactorInput.value = hex.toUpperCase();
        }

        // Metallic Factor
        if (metallicFactorRange && metallicFactorValue) {
            metallicFactorRange.value = material.pbrMetallicRoughness.metallicFactor;
            metallicFactorValue.value = material.pbrMetallicRoughness.metallicFactor;
        }

        // Roughness Factor
        if (roughnessFactorRange && roughnessFactorValue) {
            roughnessFactorRange.value = material.pbrMetallicRoughness.roughnessFactor;
            roughnessFactorValue.value = material.pbrMetallicRoughness.roughnessFactor;
        }

        // Emissive Factor
        if (emissiveFactorInput) {
            const emissive = material.emissiveFactor;
            if (emissive) {
                const hex = `#${Math.round(emissive[0] * 255).toString(16).padStart(2, '0')}${Math.round(emissive[1] * 255).toString(16).padStart(2, '0')}${Math.round(emissive[2] * 255).toString(16).padStart(2, '0')}`;
                emissiveFactorInput.value = hex.toUpperCase();
            }
        }

        // Alpha Factor
        if (alphaFactorRange && alphaFactorValue) {
            const baseColor = material.pbrMetallicRoughness.baseColorFactor;
            const alpha = baseColor ? baseColor[3] : 1;
            alphaFactorRange.value = alpha;
            alphaFactorValue.value = alpha;
        }

        // Double Sided
        if (doubleSidedCheckbox) {
            doubleSidedCheckbox.checked = material.getDoubleSided();
        }

        // Alpha Mode
        if (alphaBlendModeSelect) {
            alphaBlendModeSelect.value = material.getAlphaMode();
        }

        // Alpha Cutoff
        if (alphaCutoffInput) {
            alphaCutoffInput.value = material.getAlphaCutoff();
        }

        // Texture previews - These will need more advanced logic to display actual textures
        // For now, we'll just indicate if a texture *might* be present based on properties
        baseColorTexturePreview.textContent = material.pbrMetallicRoughness.baseColorTexture ? 'Texture Set' : 'No Texture';
        metallicRoughnessTexturePreview.textContent = material.pbrMetallicRoughness.metallicRoughnessTexture ? 'Texture Set' : 'No Texture';
        normalTexturePreview.textContent = material.normalTexture ? 'Texture Set' : 'No Texture';
        emissiveTexturePreview.textContent = material.emissiveTexture ? 'Texture Set' : 'No Texture';
        occlusionTexturePreview.textContent = material.occlusionTexture ? 'Texture Set' : 'No Texture';
    }

    // Helper to get currently selected material from model-viewer
    function getSelectedMaterial() {
        if (!modelViewerElement || !modelViewerElement.model || !modelViewerElement.model.materials) {
            return null;
        }
        return modelViewerElement.model.materials[currentMaterialIndex];
    }

    // --- Hotspot Tab Functionality ---

    // Function to add a hotspot
    if (addHotspotBtn) {
        addHotspotBtn.addEventListener('click', () => {
            if (!modelViewerElement || !modelViewerElement.loaded) {
                alert('Please load a GLB model first.');
                return;
            }
            if (!isPlacingHotspot) {
                isPlacingHotspot = true;
                modelViewerElement.style.cursor = 'crosshair'; // Change cursor to indicate placement mode
                modelViewerElement.removeAttribute('camera-controls'); // Temporarily disable camera controls for precise placement
                alert('Click on the model to place a hotspot.');
            } else {
                isPlacingHotspot = false;
                modelViewerElement.style.cursor = 'grab';
                modelViewerElement.setAttribute('camera-controls', ''); // Re-enable camera controls
            }
        });
    }

    // Function to handle hotspot repositioning
    if (repositionHotspotBtn) {
        repositionHotspotBtn.addEventListener('click', () => {
            if (currentHotspotIndex === -1) {
                alert('Please select a hotspot to reposition.');
                return;
            }
            if (!isRepositioningHotspot) {
                isRepositioningHotspot = true;
                modelViewerElement.style.cursor = 'crosshair';
                modelViewerElement.removeAttribute('camera-controls');
                alert('Click on the model to reposition the selected hotspot.');
            } else {
                isRepositioningHotspot = false;
                modelViewerElement.style.cursor = 'grab';
                modelViewerElement.setAttribute('camera-controls', '');
            }
        });
    }

    // Function to delete selected hotspot
    if (deleteHotspotBtn) {
        deleteHotspotBtn.addEventListener('click', () => {
            if (currentHotspotIndex === -1) {
                alert('Please select a hotspot to delete.');
                return;
            }

            const hotspotIdToDelete = hotspotsArray[currentHotspotIndex].id;
            // Remove from model-viewer DOM
            const hotspotDiv = modelViewerElement.querySelector(`[slot="${hotspotIdToDelete}"]`);
            if (hotspotDiv) {
                hotspotDiv.remove();
            }
            // Remove from array
            hotspotsArray.splice(currentHotspotIndex, 1);
            currentHotspotIndex = -1; // No hotspot selected
            selectedHotspotControlsSection.style.display = 'none';
            alert('Hotspot deleted.');
        });
    }

    // Logic for repositioning an existing hotspot
    function updateHotspotPosition(hotspotId, position, normal) {
        const hotspotDiv = modelViewerElement.querySelector(`[slot="${hotspotId}"]`);
        if (hotspotDiv) {
            hotspotDiv.dataset.position = position;
            hotspotDiv.dataset.normal = normal;
            // For now, model-viewer automatically updates visual position based on dataset attributes
            // modelViewerElement.requestUpdate(); // Request an update after changing attributes
            console.log(`Hotspot ${hotspotId} repositioned to:`, position, normal);
        }
    }

    // Event listener for clicks on the model-viewer to add/reposition hotspots
    function setupModelViewerEventListeners() {
        if (modelViewerElement) {
            modelViewerElement.removeEventListener('click', handleModelViewerClickForHotspot); // Prevent duplicate listeners
            modelViewerElement.addEventListener('click', handleModelViewerClickForHotspot);
        }
    }

    function handleModelViewerClickForHotspot(event) {
        const hit = event.detail.hit;
        if (hit && hit.distance && hit.normal && hit.position) {
            const positionString = `${hit.position.x}m ${hit.position.y}m ${hit.position.z}m`;
            const normalString = `${hit.normal.x} ${hit.normal.y} ${hit.normal.z}`;

            if (isRepositioningHotspot && currentHotspotIndex !== -1) {
                // Reposition existing hotspot
                const hotspotToReposition = hotspotsArray[currentHotspotIndex];
                hotspotToReposition.position = positionString;
                hotspotToReposition.normal = normalString;
                updateHotspotPosition(hotspotToReposition.id, positionString, normalString);
                populateHotspotPanel(hotspotToReposition); // Update UI with new position
                isRepositioningHotspot = false;
                modelViewerElement.style.cursor = 'grab';
                modelViewerElement.setAttribute('camera-controls', ''); // Re-enable camera controls
                alert('Hotspot repositioned successfully!');

            } else if (isPlacingHotspot) {
                // Add new hotspot
                // const { position, normal } = hit; // Old way
                const newHotspotId = `hotspot-${Date.now()}`; 

                const newHotspotData = {
                    id: newHotspotId,
                    title: 'New Hotspot',
                    text: 'Some details about this spot.',
                    link: '',
                    linkLabel: '',
                    position: positionString, // Use parsed string
                    normal: normalString,   // Use parsed string
                    openOnLoad: false,
                    placement: 'top-center'
                };
                hotspotsArray.push(newHotspotData);
                currentHotspotIndex = hotspotsArray.length - 1;

                const hotspotDiv = document.createElement('div');
                hotspotDiv.classList.add('hotspot-annotation');
                hotspotDiv.slot = newHotspotId;
                hotspotDiv.dataset.position = newHotspotData.position;
                hotspotDiv.dataset.normal = newHotspotData.normal;
                hotspotDiv.dataset.placement = newHotspotData.placement || 'top-center';
                if (newHotspotData.openOnLoad) { // Addresses hotspot 'open' attribute
                    hotspotDiv.setAttribute('open', '');
                }
                let linkHTML = ''; // Addresses hotspot link HTML
                if (newHotspotData.link) {
                    constlinkLabel = newHotspotData.linkLabel || newHotspotData.link;
                    linkHTML = `<p><a href="${newHotspotData.link}" target="_blank">${linkLabel}</a></p>`;
                }
                hotspotDiv.innerHTML = `
                    <div class="hotspot-visual-cue"></div>
                    <div class="hotspot-content-wrapper">
                        <strong>${newHotspotData.title}</strong>
                        <p>${newHotspotData.text}</p>
                        ${linkHTML}
                    </div>
                `;
                modelViewerElement.appendChild(hotspotDiv);
                modelViewerElement.requestUpdate(); // Request an update after adding the hotspot

                populateHotspotPanel(newHotspotData);
                selectedHotspotControlsSection.style.display = 'block';
                isPlacingHotspot = false;
                modelViewerElement.style.cursor = 'grab';
                modelViewerElement.setAttribute('camera-controls', ''); // Re-enable camera controls
                console.log('Hotspot added:', newHotspotData);
            } else {
                console.log('Clicked on empty space or invalid surface point. Hotspot placement cancelled.');
                isPlacingHotspot = false; // Exit placing mode
                if (modelViewerElement) {
                    modelViewerElement.style.cursor = 'grab'; // Reset cursor
                    modelViewerElement.setAttribute('camera-controls', ''); // Re-enable camera controls
                }
            }
        }
    }

    // Function to populate hotspot panel with selected hotspot data
    function populateHotspotPanel(hotspotData) {
        if (!hotspotData) {
            // Clear inputs if no hotspot selected
            hotspotTitleInput.value = '';
            hotspotTextInput.value = '';
            hotspotLinkInput.value = '';
            hotspotLinkLabelInput.value = '';
            hotspotOpenOnLoadCheckbox.checked = false;
            updatePlacementGridUI('');
            selectedHotspotControlsSection.style.display = 'none';
            return;
        }

        hotspotTitleInput.value = hotspotData.title || '';
        hotspotTextInput.value = hotspotData.text || '';
        hotspotLinkInput.value = hotspotData.link || '';
        hotspotLinkLabelInput.value = hotspotData.linkLabel || '';
        hotspotOpenOnLoadCheckbox.checked = hotspotData.openOnLoad || false;
        updatePlacementGridUI(hotspotData.placement || 'top-center');
        selectedHotspotControlsSection.style.display = 'block';
    }

    // Function to update the visual state of the hotspot placement grid
    function updatePlacementGridUI(placementValue) {
        const buttons = hotspotPlacementGrid.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.dataset.placement === placementValue) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Hotspot data update listeners
    [hotspotTitleInput, hotspotTextInput, hotspotLinkInput, hotspotLinkLabelInput].forEach(input => {
        if(input) {
            input.addEventListener('input', () => {
                if (currentHotspotIndex === -1 || !hotspotsArray[currentHotspotIndex]) return;
                
                const currentData = hotspotsArray[currentHotspotIndex];
                currentData.title = hotspotTitleInput.value;
                currentData.text = hotspotTextInput.value;
                currentData.link = hotspotLinkInput.value;
                currentData.linkLabel = hotspotLinkLabelInput.value;

                // Update the visual representation in model-viewer
                const hotspotDiv = modelViewerElement.querySelector(`[slot="${currentData.id}"]`);
                if (hotspotDiv) {
                    // Rebuild innerHTML if title/text changes to keep structure
                    let linkHTML = ''; // Addresses hotspot link HTML
                    if (currentData.link) {
                        constlinkLabel = currentData.linkLabel || currentData.link;
                        linkHTML = `<p><a href="${currentData.link}" target="_blank">${linkLabel}</a></p>`;
                    }
                    hotspotDiv.innerHTML = `
                        <div class="hotspot-visual-cue"></div>
                        <div class="hotspot-content-wrapper">
                            <strong>${currentData.title}</strong>
                            <p>${currentData.text}</p>
                            ${linkHTML}
                        </div>
                    `;
                }
            });
        }
    });

    if (hotspotOpenOnLoadCheckbox) {
        hotspotOpenOnLoadCheckbox.addEventListener('change', (event) => {
            if (currentHotspotIndex === -1 || !hotspotsArray[currentHotspotIndex]) return;
            const currentData = hotspotsArray[currentHotspotIndex];
            currentData.openOnLoad = event.target.checked;
            const hotspotDiv = modelViewerElement.querySelector(`[slot="${currentData.id}"]`);
            if (hotspotDiv) {
                if (currentData.openOnLoad) {
                    hotspotDiv.setAttribute('open', '');
                } else {
                    hotspotDiv.removeAttribute('open');
                }
            }
        });
    }

    if (hotspotPlacementGrid) {
        hotspotPlacementGrid.addEventListener('click', (event) => {
            const targetButton = event.target.closest('button');
            if (!targetButton || currentHotspotIndex === -1 || !hotspotsArray[currentHotspotIndex]) return;

            const placementValue = targetButton.dataset.placement;
            hotspotsArray[currentHotspotIndex].placement = placementValue;
            updatePlacementGridUI(placementValue);
            const hotspotDiv = modelViewerElement.querySelector(`[slot="${hotspotsArray[currentHotspotIndex].id}"]`);
            if (hotspotDiv) {
                hotspotDiv.dataset.placement = placementValue;
                // modelViewerElement.requestUpdate(); // Not always needed for dataset changes, but good for safety
            }
        });
    }

    // Function to gather material overrides for saving
    function gatherMaterialOverrides() {
        // Simplification: Save properties of the *currently selected* material only.
        // A real implementation would iterate through all materials and store changes.
        const overrides = [];
        const material = getSelectedMaterial();
        if (material) {
            const materialIndex = parseInt(materialSelect.value, 10);
            const bcFactor = material.pbrMetallicRoughness.baseColorFactor;
            const overrideData = {
                materialIndex: materialIndex,
                name: material.name || `Material (${materialIndex + 1})`,
                baseColorFactor: bcFactor ? [...bcFactor] : [1,1,1,1],
                metallicFactor: material.pbrMetallicRoughness.metallicFactor,
                roughnessFactor: material.pbrMetallicRoughness.roughnessFactor,
                // Add textures if needed, requires saving texture info/source
                // baseColorTexture: material.pbrMetallicRoughness.baseColorTexture?.texture?.source?.uri || null,
                emissiveFactor: [...material.emissiveFactor],
                doubleSided: material.getDoubleSided(),
                alphaMode: material.getAlphaMode(),
                alphaCutoff: material.getAlphaCutoff()
            };
            overrides.push(overrideData);
        }
        return overrides;
    }

    // --- Save Project State Logic ---
    if (savePublishBtn) {
        savePublishBtn.addEventListener('click', async () => { // Made async
            if (savePublishBtn.disabled) return;

            if (!modelViewerElement || !currentModelName || !posterGenerated) {
                alert('Cannot save. Ensure a model is loaded, project name is set (using model name for now), and a poster is generated.');
                return;
            }

            // 1. Gather current state (metadata)
            const currentState = {
                modelInfo: {
                    name: currentModelName
                },
                environmentInfo: {
                    source: modelViewerElement.environmentImage || 'default',
                    hdrName: currentHDRName // Store HDR name
                },
                posterDataUrl: posterPreview.querySelector('img')?.src || null,
                camera: {
                    target: modelViewerElement.cameraTarget,
                    orbit: modelViewerElement.cameraOrbit
                },
                lighting: {
                    exposure: modelViewerElement.exposure,
                    shadowIntensity: modelViewerElement.shadowIntensity,
                    shadowSoftness: modelViewerElement.shadowSoftness,
                    useSkybox: skyboxEnvCheckbox.checked,
                    bgColor: modelViewerElement.style.backgroundColor || '#FFFFFF'
                },
                materialOverrides: gatherMaterialOverrides(), // Function to gather overrides
                hotspots: hotspotsArray // Use the existing array
            };

            // 2. Upload GLB file to backend
            if (currentGlbFile) {
                const formData = new FormData();
                formData.append('glbFile', currentGlbFile);

                try {
                    const response = await fetch('http://localhost:5000/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const message = await response.text();
                        console.log('Backend response:', message);
                        alert(`Το αρχείο ${currentGlbFile.name} ανεβάστηκε επιτυχώς!`);
                    } else {
                        const errorText = await response.text();
                        console.error('Σφάλμα ανεβάσματος αρχείου:', response.status, errorText);
                        alert(`Αποτυχία ανεβάσματος αρχείου: ${errorText}`);
                    }
                } catch (error) {
                    console.error('Σφάλμα δικτύου κατά το ανέβασμα του αρχείου:', error);
                    alert('Σφάλμα δικτύου. Ελέγξτε ότι το backend server τρέχει.');
                }
            } else {
                alert('Δεν υπάρχει αρχείο GLB για αποθήκευση στο backend.');
            }

            // 3. Save project state (metadata) to localStorage for now.
            // In the future, this state could also be sent to the backend
            // along with the GLB file, or associated with the GLB file's ID.
            try {
                localStorage.setItem('arMenuProjectData', JSON.stringify(currentState));
                alert('Project state saved successfully (to localStorage)!'); // Changed alert text
                console.log('Saved State to localStorage:', currentState);
            } catch (error) {
                console.error('Error saving project state to localStorage:', error);
                alert('Failed to save project state to localStorage. LocalStorage might be full or disabled.');
            }
        });
    }

    // --- Load Project State Logic (Run on DOMContentLoaded) ---
    function loadProjectState() {
        const savedDataString = localStorage.getItem('arMenuProjectData');
        if (!savedDataString) {
            console.log('No saved project state found.');
            return;
        }

        try {
            const savedState = JSON.parse(savedDataString);
            console.log('Loading Saved State:', savedState);

            // IMPORTANT: We don't reload GLB/HDR files here. User must load them manually.
            // We only apply the settings if a model-viewer element exists.

            if (modelViewerElement) {
                 // Apply Camera Settings
                if(savedState.camera) {
                    modelViewerElement.cameraTarget = savedState.camera.target || '0m 0m 0m';
                    modelViewerElement.cameraOrbit = savedState.camera.orbit || '0deg 75deg auto';
                    // Update UI controls for camera
                    const targetParts = modelViewerElement.cameraTarget.split(' ');
                    orbitCenterXInput.value = parseFloat(targetParts[0] || 0);
                    orbitCenterYInput.value = parseFloat(targetParts[1] || 0);
                    orbitCenterZInput.value = parseFloat(targetParts[2] || 0);
                    const orbitParts = modelViewerElement.cameraOrbit.split(' ');
                    cameraYawInput.value = parseFloat(orbitParts[0] || 0);
                    cameraPitchInput.value = parseFloat(orbitParts[1] || 75);
                }

                // Apply Lighting Settings
                if(savedState.lighting) {
                    modelViewerElement.exposure = savedState.lighting.exposure ?? 1.0;
                    modelViewerElement.shadowIntensity = savedState.lighting.shadowIntensity ?? 1.0;
                    modelViewerElement.shadowSoftness = savedState.lighting.shadowSoftness ?? 1.0;
                    // Apply background color/skybox
                    skyboxEnvCheckbox.checked = savedState.lighting.useSkybox ?? false;
                     if (savedState.lighting.useSkybox && modelViewerElement.environmentImage) {
                         modelViewerElement.skyboxImage = modelViewerElement.environmentImage;
                         modelViewerElement.style.backgroundColor = 'transparent'; // Ensure bg color doesn't interfere
                    } else {
                        modelViewerElement.skyboxImage = '';
                        modelViewerElement.style.backgroundColor = savedState.lighting.bgColor || '#FFFFFF';
                    }
                    // Update UI controls for lighting
                    exposureRange.value = modelViewerElement.exposure;
                    exposureValueInput.value = modelViewerElement.exposure;
                    shadowIntensityRange.value = modelViewerElement.shadowIntensity;
                    shadowIntensityValueInput.value = modelViewerElement.shadowIntensity;
                    shadowSoftnessRange.value = modelViewerElement.shadowSoftness;
                    shadowSoftnessValueInput.value = modelViewerElement.shadowSoftness;
                    bgColorPicker.value = savedState.lighting.bgColor || '#FFFFFF';
                }

                // Apply Poster
                if (savedState.posterDataUrl && posterPreview) {
                    const img = document.createElement('img');
                    img.src = savedState.posterDataUrl;
                    img.alt = 'Model poster';
                    posterPreview.innerHTML = '';
                    posterPreview.appendChild(img);
                    generatePosterBtn.textContent = 'REGENERATE POSTER';
                    posterGenerated = true;
                } else {
                    posterGenerated = false;
                }

                // Apply Material Overrides (Simplified: Apply first override to first material)
                if (savedState.materialOverrides && savedState.materialOverrides.length > 0 && modelViewerElement.model && modelViewerElement.model.materials.length > 0) {
                    const override = savedState.materialOverrides[0]; // Apply first saved override
                    const material = modelViewerElement.model.materials[0]; // To the first material
                    if(material) {
                        material.pbrMetallicRoughness.setBaseColorFactor(override.baseColorFactor || [1,1,1,1]);
                        material.pbrMetallicRoughness.setMetallicFactor(override.metallicFactor ?? 1);
                        material.pbrMetallicRoughness.setRoughnessFactor(override.roughnessFactor ?? 1);
                        material.setEmissiveFactor(override.emissiveFactor || [0,0,0]);
                        material.setDoubleSided(override.doubleSided ?? false);
                        material.setAlphaMode(override.alphaMode || 'OPAQUE');
                        material.setAlphaCutoff(override.alphaCutoff ?? 0.5);
                        // Update material UI for the first material
                        if (materialSelect.options.length > 0) {
                             materialSelect.value = '0'; // Select first material in dropdown
                             displayMaterialProperties(material);
                         }
                    }
                }

                // Apply Hotspots
                if (savedState.hotspots && savedState.hotspots.length > 0) {
                    // Clear existing hotspots before loading saved ones
                    modelViewerElement.querySelectorAll('.hotspot-annotation').forEach(h => h.remove());
                    hotspotsArray = []; // Reset array

                    savedState.hotspots.forEach(savedHotspot => {
                        const newHotspotData = { ...savedHotspot }; // Create a copy
                        hotspotsArray.push(newHotspotData); // Add to array

                        const hotspotDiv = document.createElement('div');
                        hotspotDiv.classList.add('hotspot-annotation');
                        hotspotDiv.slot = newHotspotData.id;
                        hotspotDiv.dataset.position = newHotspotData.position;
                        hotspotDiv.dataset.normal = newHotspotData.normal;
                        hotspotDiv.dataset.placement = newHotspotData.placement || 'top-center';
                        if (newHotspotData.openOnLoad) {
                            hotspotDiv.setAttribute('open', '');
                        }

                        let linkHTML = '';
                        if (newHotspotData.link) {
                            const linkLabel = newHotspotData.linkLabel || newHotspotData.link;
                            linkHTML = `<p><a href="${newHotspotData.link}" target="_blank">${linkLabel}</a></p>`;
                        }
                        hotspotDiv.innerHTML = `
                            <div class="hotspot-visual-cue"></div>
                            <div class="hotspot-content-wrapper">
                                <strong>${newHotspotData.title}</strong>
                                <p>${newHotspotData.text}</p>
                                ${linkHTML}
                            </div>
                        `;
                        modelViewerElement.appendChild(hotspotDiv);
                    });
                    modelViewerElement.requestUpdate(); // Request update after adding all hotspots
                }
                
                updateFooterWarnings(); // Update save button state etc.

                alert('Project state loaded (settings applied to current model).');

            } else {
                console.log('Model not yet loaded. Cannot apply saved settings.');
            }

        } catch (error) {
            console.error('Error loading project state from localStorage:', error);
            localStorage.removeItem('arMenuProjectData'); // Clear corrupted data
        }
    }

    // We need to add a button to HTML first. Let's assume a button with id="loadStateBtn" exists.
    const loadStateBtn = document.getElementById('loadStateBtn');
    if(loadStateBtn) { loadStateBtn.addEventListener('click', loadProjectState); }
    // Since no button exists yet, we will NOT call loadProjectState automatically.

    // --- Function to Update Dimension Display ---
    function updateDimensionDisplay() {
        if (modelViewerElement && modelViewerElement.loaded) {
            const dims = modelViewerElement.getDimensions();
            // Convert meters to cm and format
            if(dimensionXSpan) dimensionXSpan.textContent = `${(dims.x * 100).toFixed(1)} cm`;
            if(dimensionYSpan) dimensionYSpan.textContent = `${(dims.y * 100).toFixed(1)} cm`;
            if(dimensionZSpan) dimensionZSpan.textContent = `${(dims.z * 100).toFixed(1)} cm`;
        } else {
            if(dimensionXSpan) dimensionXSpan.textContent = '-- cm';
            if(dimensionYSpan) dimensionYSpan.textContent = '-- cm';
            if(dimensionZSpan) dimensionZSpan.textContent = '-- cm';
        }
    }

    // --- Function to Update Scale Input based on current model scale ---
    function updateScaleInput() {
        if (modelViewerElement && modelViewerElement.scale) {
            const scaleParts = modelViewerElement.scale.split(' ');
            // Assuming uniform scale for now, take the first component
            currentModelScale.x = parseFloat(scaleParts[0]);
            currentModelScale.y = parseFloat(scaleParts[1]);
            currentModelScale.z = parseFloat(scaleParts[2]);

            if(scaleInput) {
                scaleInput.value = currentModelScale.x;
                applyScaleBtn.disabled = true; // Disable if already at current scale
            }
        }
    }
    
    // --- Event Listener for Scale Input Changes ---
    if(scaleInput && applyScaleBtn) {
        scaleInput.addEventListener('input', () => {
            // Enable apply button only if model is loaded and value is a valid number
            if (modelViewerElement && modelViewerElement.loaded && !isNaN(parseFloat(scaleInput.value))) {
                applyScaleBtn.disabled = parseFloat(scaleInput.value) === currentModelScale.x; // Disable if new scale is same as current (assuming uniform scale for now)
            } else {
                applyScaleBtn.disabled = true;
            }
        });

        applyScaleBtn.addEventListener('click', () => {
            if (!modelViewerElement || !modelViewerElement.loaded) return;

            const newScaleValue = parseFloat(scaleInput.value);
            if (isNaN(newScaleValue) || newScaleValue <= 0) {
                alert("Please enter a valid positive number for scale.");
                return;
            }

            // Assuming uniform scaling for now
            const newScaleString = `${newScaleValue} ${newScaleValue} ${newScaleValue}`;
            modelViewerElement.scale = newScaleString;
            
            // Update internal current scale tracking
            currentModelScale.x = newScaleValue;
            currentModelScale.y = newScaleValue;
            currentModelScale.z = newScaleValue;

            updateDimensionDisplay(); // Update dimensions after applying scale
            applyScaleBtn.disabled = true; // Disable after applying
        });
    }

}); 