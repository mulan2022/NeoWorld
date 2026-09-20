# NeoWorld-3: Building Interactive Worlds for Embodied Intelligence

For decades, one of the central goals of artificial intelligence has been to build systems that can understand and interact with the world around them. Early AI systems excelled in structured environments where the rules were predefined. However, the physical world is fundamentally different: it is continuous, dynamic, and full of complex interactions. A robot does not simply need to recognize an object; it needs to understand how that object is structured, how it can move, how it responds to forces, and how it can be manipulated. This challenge has motivated a new paradigm for embodied intelligence: real-to-sim-to-real learning. Instead of collecting all possible experiences directly from the real world, we can reconstruct realistic environments, train intelligent agents inside simulation, and transfer their learned skills back to physical robots.

The idea of learning inside artificial worlds has long been imagined in science fiction. In *The Matrix*, Neo enters a virtual environment where he learns new abilities through interaction. While the real world is far more complex than any fictional simulation, the underlying idea captures an important vision for embodied intelligence:

> To build truly intelligent machines, we need scalable worlds where they can learn, interact, and improve.

However, creating such worlds remains one of the biggest challenges today. A simulator requires much more than visual realism. A world that looks realistic but cannot be modified, interacted with, or physically simulated is insufficient for training embodied agents. For embodied intelligence, reconstruction must move beyond generating assets. The ultimate goal is building interactive worlds.

## Introducing NeoWorld-3

We introduce NeoWorld-3, an agentic framework for reconstructing simulation-ready interactive worlds from visual observations. The recent emergence of large vision-language models and coding agents represents a fundamental opportunity for 3D reconstruction. For decades, reconstruction systems have primarily focused on directly predicting geometric representations from observations. While these methods have achieved impressive visual quality, they remain limited by the difficulty of directly inferring complex structures, interactions, and physical constraints.

We believe the combination of foundation models and coding agents marks a turning point for 3D reconstruction. By allowing models to reason, write programs, invoke tools, inspect outcomes, and iteratively refine their solutions, reconstruction can evolve from direct prediction into an interactive construction process. NeoWorld-3 explores and demonstrates this new paradigm: coding-agent based reconstruction as a future direction for building interactive 3D worlds.

NeoWorld-3 is designed around three core principles: simulation-ready reconstruction, coding-agent based world construction, and object-to-scene scaling. Simulation-ready reconstruction focuses on creating worlds that preserve the geometry, articulation, and physical validity required for downstream simulation. Coding-agent based reconstruction enables vision-language models to actively construct and refine worlds through interactive tools. Object-to-scene reconstruction allows the same framework to scale from individual objects to complex environments. Together, these ideas transform reconstruction from a static generation task into an iterative process of reasoning, construction, verification, and refinement.

## A New Paradigm: Reconstruction Through Coding Agents

Most existing 3D reconstruction systems are built around direct generation. Given an observation, the model predicts a final representation. This approach has driven tremendous progress, but it also introduces a fundamental limitation: the reasoning process behind the reconstruction is hidden inside the generated result. A mesh does not explicitly describe why an object has a particular structure, how its components are related, or how it should be modified when requirements change.

Humans do not design complex objects by directly predicting every geometric element. Instead, we construct them through a sequence of operations: defining components, establishing relationships, modifying parameters, testing results, and refining errors. The recent progress of coding agents provides an opportunity to bring this construction process into 3D reconstruction.

NeoWorld-3 does not assume that models should directly predict the final world. Instead, vision-language agents can reason about reconstruction tasks, generate modeling programs, interact with tools, evaluate intermediate results, and continuously refine their outputs through NeoMCP and NeoSDK. This enables a new way of thinking about reconstruction: the model is no longer only generating geometry, but actively building an interactive world.

## Agentic World Construction with NeoMCP and NeoSDK

NeoWorld-3 is built around a hierarchical agentic architecture that enables reconstruction to scale from individual objects to complete interactive scenes. Instead of treating a scene as a monolithic generation task, NeoWorldStudio acts as a world-building agent that reasons about the overall environment, decomposes complex scenes into individual entities, assigns reconstruction objectives, and coordinates the entire reconstruction process.

Each object reconstruction task is then handled by an object-level sub-agent with specialized capabilities. These agents focus on understanding object structures, constructing geometry, reasoning about part relationships, and preparing assets for interaction. By turning object reconstruction into an independent and reusable capability, NeoWorld-3 allows complex scenes to be composed from multiple interacting object-level reconstruction processes.

This hierarchical design creates a reconstruction loop where high-level scene understanding guides object-level construction, while object-level results continuously refine the overall world representation. Through NeoMCP, agents can dynamically access different modeling capabilities, while NeoSDK provides the underlying geometric, rendering, and optimization tools required for construction and refinement. Rather than generating a static result in a single step, NeoWorld-3 enables agents to iteratively build, inspect, and improve interactive worlds through continuous interaction between reasoning and execution.

## Differentiable Refinement: Combining Intelligence with Optimization

One of the key challenges we encountered in reconstruction is that vision-language models are excellent at understanding visual concepts and structural relationships, but precise geometric parameter prediction remains difficult. Even when a model understands what an object should look like, obtaining highly accurate geometry directly from numerical prediction is challenging.

NeoWorld-3 introduces Differentiable Refinement to address this limitation. Instead of requiring the model to perfectly estimate every geometric parameter, the agent first constructs an initial reconstruction and then refines it through differentiable rendering. The rendered reconstruction is compared with the original observation, and image similarity is used as the optimization objective. The parameters inside the generated geometric representation are optimized through gradient-based refinement.

This creates a complementary relationship between reasoning and optimization. The vision-language model provides semantic understanding, decomposition strategies, and reconstruction programs, while differentiable optimization provides the numerical accuracy required for high-fidelity reconstruction. Rather than relying solely on prediction, NeoWorld-3 enables the reconstruction process to actively improve itself through visual feedback.

## Building Truly Simulation-Ready Interactive Worlds

For embodied intelligence, reconstruction quality is ultimately measured by interaction. A robot does not simply observe an object. It grasps it, moves it, collides with it, and changes its state. Small geometric errors can therefore lead to significant failures during simulation.

NeoWorld-3 introduces dedicated geometry validation tools to ensure reconstructed worlds are physically reliable. A key component is our watertight geometry pipeline. Watertightness is not merely a mesh quality requirement; it is a foundation for reliable physical interaction. Without watertight geometry, collision detection and penetration checking become unreliable, making realistic simulation difficult.

NeoWorld-3 achieves watertight reconstruction by removing self-intersecting regions and smoothing the connections between different object parts. This allows reconstructed objects to maintain consistent geometry and reliable interaction boundaries.

After geometry validation, NeoWorld-3 can further prepare objects for articulation and simulation. The system can reason about object parts, establish joint relationships, evaluate motion ranges, and repair invalid configurations before deployment into simulation environments.

Through these capabilities, NeoWorld-3 transforms reconstructed assets into interactive worlds suitable for embodied learning. These worlds can then be deployed into physical simulators for physics-based validation and agent training, creating a feedback loop where simulation insights can further improve future reconstruction.

## Looking Ahead

The history of artificial intelligence has repeatedly shown that new capabilities emerge when models gain the ability to reason, use tools, and interact with their environment. Large language models became powerful not only because they generated text, but because they learned to use tools, write programs, and complete complex workflows.

We believe 3D reconstruction is undergoing a similar transition. The future of reconstruction will not be defined only by larger generative models that output better meshes. Instead, it will be defined by intelligent agents that can understand the world, construct representations, invoke tools, verify results, and continuously improve. Coding-agent based reconstruction provides a path toward this future, transforming reconstruction from a static generation task into an interactive process of reasoning, construction, verification, and refinement.

As foundation models continue to improve, NeoWorld-3 aims to scale from individual objects to increasingly complex environments, eventually enabling general-purpose reconstruction of diverse real-world scenarios. More importantly, NeoWorld-3 is designed around a larger vision: creating a complete bridge between physical observations, interactive world reconstruction, simulation learning, and real-world deployment.

The reconstructed world is not an endpoint, but a scalable training environment where embodied agents can acquire skills through interaction. Once interactive worlds can be automatically reconstructed from real observations, they can support large-scale simulation-based learning, allowing agents to explore environments, practice behaviors, receive physical feedback, and transfer learned skills back into reality. This creates a continuous connection between the real world and simulation: real observations provide the foundation for reconstruction; reconstructed worlds provide scalable environments for learning; and learned behaviors improve future interaction with the physical world.

Our long-term vision is to build the foundation for the next generation of embodied intelligence: A world where AI systems can not only perceive and understand, but also interact with and learn within it.