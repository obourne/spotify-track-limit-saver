const axios = require("axios");
const querystring = require("querystring");

const TOKEN = process.env.SPOTIFY_TOKEN;
if (!TOKEN) {
	console.log(
		"You need to pass an OAuth token with user-library-modify permissions as SPOTIFY_TOKEN env var. You can generate one for your account here: https://developer.spotify.com/console/delete-current-user-saved-tracks/"
	);
	return;
}
const DRY_RUN = Boolean(process.env.DRY_RUN);
const ALBUMS_BATCH_SIZE = 5;
const BATCH_LIMIT = 500;

const updatedAlbumIds = [];

const request = async options => {
	const response = await axios({
		method: "get",
		headers: {
			Authorization: `Bearer ${TOKEN}`
		},
		...options
	});
	return response.data;
};

const checkTracksSaved = async ids => {
	const tracksSavedStatus = await request({
		url: "https://api.spotify.com/v1/me/tracks/contains",
		params: { ids: ids.join(",") }
	});
	const isStatusTrue = status => status === true;

	const allTracksSaved = tracksSavedStatus.every(isStatusTrue);
	const tracksPartiallySaved =
		!allTracksSaved && tracksSavedStatus.some(isStatusTrue);
	return {
		allTracksSaved,
		tracksPartiallySaved
	};
};

const getAlbums = async (page = 1) => {
	return await request({
		url: "https://api.spotify.com/v1/me/albums",
		params: { limit: ALBUMS_BATCH_SIZE, offset: ALBUMS_BATCH_SIZE * (page - 1) }
	});
};

const removeTracks = async ids => {
	return await request({
		method: "delete",
		url: "https://api.spotify.com/v1/me/tracks",
		params: { ids: ids.join(",") }
	});
};

const saveAlbum = async id => {
	return await request({
		method: "put",
		url: "https://api.spotify.com/v1/me/albums",
		params: { ids: id }
	});
};

const migrateAlbum = async album => {
	const { id, name, tracks, artists } = album;
	const artistName = artists[0] ? artists[0].name : "Unknown";
	const albumLabel = `"${name}" by ${artistName}`;
	try {
		const trackIds = tracks.items.map(item => item.id);
		const { allTracksSaved, tracksPartiallySaved } = await checkTracksSaved(
			trackIds
		);

		if (!allTracksSaved) {
			console.log(
				`Skipping ${albumLabel} as: ${
					tracksPartiallySaved ? "Album partially saved" : "No tracks saved"
				}`
			);
			return;
		}
		if (!DRY_RUN) {
			await removeTracks(trackIds);
			console.log(`Updated ${albumLabel}`);
		} else {
			console.log(`Would have updated ${albumLabel}`);
		}
		updatedAlbumIds.push(id);
	} catch (e) {
		console.log(`Error updating ${albumLabel}`, e);
	}
};

const migrateAlbumsInResults = async albumResultItems => {
	for (albumItem of albumResultItems) {
		await migrateAlbum(albumItem.album);
	}
};

const migrateAllAlbums = async () => {
	let page = 1;
	let hasNext = false;
	try {
		do {
			const results = await getAlbums(page);
			await migrateAlbumsInResults(results.items);
			page++;
			hasNext = results.next;
		} while (hasNext && page < BATCH_LIMIT);
	} catch (e) {
		console.log(
			`Unexpected Error in album batch #${page}. Abandoning further updates.`,
			e
		);
	}
	if (updatedAlbumIds.length > 0) {
		console.log("Updated Album ids (just in case):\n", updatedAlbumIds);
		console.log(
			`\n\nUpdate completed: ${updatedAlbumIds.length} albums updated`
		);
	} else {
		console.log("No albums updated");
	}
};

migrateAllAlbums();
