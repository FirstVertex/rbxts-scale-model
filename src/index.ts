/**
 * Scale a Model and all descendants uniformly
 * @param model The Model to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 */
export function scaleModel(model: Model, scale: number) {
	if (scale === 1) {
		return;
	}
	const pPart = model.PrimaryPart;
	const origin = pPart?.Position;
	if (!pPart || !origin) {
		print("Unable to scale model, no PrimaryPart has been defined");
		return;
	}
	_scaleDescendants(model.GetDescendants(), scale, origin);
}

/**
 * Scale a Part and all descendants uniformly
 * @param part The Part to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Part's Position
 */
export function scalePart(part: BasePart, scale: number, center?: Vector3) {
	if (scale === 1) {
		return;
	}
	const origin = center || part.Position;
	part.Position = origin.Lerp(part.Position, scale);
	part.Size = part.Size.mul(scale);

	_scaleDescendants(part.GetDescendants(), scale, origin);
}

function _scaleDescendants(descendants: Instance[], scale: number, origin: Vector3) {
	const parts: BasePart[] = <BasePart[]>descendants.filter((p) => p.IsA("BasePart"));
	parts.forEach((part: BasePart) => {
		part.Position = origin.Lerp(part.Position, scale);
		part.Size = part.Size.mul(scale);
	});

	const atts: Attachment[] = <Attachment[]>descendants.filter((p) => p.IsA("Attachment"));
	atts.forEach((att: Attachment) => {
		const parent = <BasePart>att.Parent;
		att.WorldPosition = parent.Position.Lerp(att.WorldPosition, scale);
	});

	const specials: SpecialMesh[] = <SpecialMesh[]>descendants.filter((p) => p.IsA("SpecialMesh"));
	specials.forEach((special: SpecialMesh) => {
		special.Scale = special.Scale.mul(scale);
	});

	const fires: Fire[] = <Fire[]>descendants.filter((p) => p.IsA("Fire"));
	fires.forEach((fire: Fire) => {
		fire.Size = math.floor(fire.Size * scale);
	});

	const particles: ParticleEmitter[] = <ParticleEmitter[]>descendants.filter((p) => p.IsA("ParticleEmitter"));
	particles.forEach((particle: ParticleEmitter) => (particle.Size = _scaleNumberSequnce(particle.Size, scale)));
}

function _scaleNumberSequnce(sequence: NumberSequence, scale: number): NumberSequence {
	return new NumberSequence(
		sequence.Keypoints.map((kp) => new NumberSequenceKeypoint(kp.Time, kp.Value * scale, kp.Envelope * scale)),
	);
}
