/**
 * Make a request to `path` with `options` and parse the response as JSON.
 * @param {*} path The url to make the reques to.
 * @param {*} options Additiona options to pass to fetch.
 */
import { error, pop_up_message } from './main.js'
const getJSON = (path, options) =>
    fetch(path, options)
    .then(res => {
        res.json().then(message => {
            if (message.message && message.message !== "success") {
                error(message.message)
                console.log(message)
            } else {
                console.log(message)
            }
        })
    })
    .catch(err => console.warn(`API_ERROR: ${err.message}`));

//api call that allows a user to like a post
export let like_post = (id, token) => {
    return getJSON(`http://127.0.0.1:5000/post/like?id=${id}`, {
        method: "PUT",
        headers: {
            'Authorization': `Token ${token}`
        },
    })
}

//api call to delete a user's own post
export let delete_post = (id, token) => {
    getJSON(`http://127.0.0.1:5000/post?id=${id}`, {
        method: "DELETE",
        headers: {
            'Authorization': `Token ${token}`
        },
    })
}

//api call for user to update their own post
export let update_post = (id, token, description) => {
    const json_body = {
        "description_text": description,
    }
    getJSON(`http://127.0.0.1:5000/post?id=${id}`, {
        method: "PUT",
        headers: {
            'Authorization': `Token ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json_body)
    })
}

//api call to allow user to change profile email,name or password
export let update_profile = (token, email = false, name = false, password = false) => {
    const json_body = {}
        //checking if any fields have been omitted
    if (email != false) json_body.email = email
    if (name != false) json_body.name = name
    if (password != false) json_body.password = password

    getJSON(`http://127.0.0.1:5000/user`, {
        method: "PUT",
        headers: {
            'Authorization': `Token ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json_body)
    })
}

//api call to post a comment
export let post_comment = (id, token, comment) => {
    const json_body = {
        "comment": comment,
    }
    getJSON(`http://127.0.0.1:5000/post/comment?id=${id}`, {
        method: "PUT",
        headers: {
            'Authorization': `Token ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json_body)
    })
}

//api call to follow a user
export let follow_user = (token, username) => {
    const res = fetch(`http://127.0.0.1:5000/user/follow?username=${username}`, {
            method: "PUT",
            headers: {
                'Authorization': `Token ${token}`
            },
        })
        .then(
            (data) => data.json()
            .then(
                posts => {
                    console.log(posts, "followed")
                    if (posts.message != "success") {
                        error(posts.message)
                    } else {
                        pop_up_message("Success!")
                    }
                }
            )
        )
}

//api call to unfollow a user
export let unfollow_user = (token, username) => {
    const res = fetch(`http://127.0.0.1:5000/user/unfollow?username=${username}`, {
            method: "PUT",
            headers: {
                'Authorization': `Token ${token}`
            },
        })
        .then(
            (data) => data.json()
            .then(
                posts => console.log(posts, "followed")
            )
        )
}

//api call to post an image
export let post_image = (token, description, src) => {
    const json_body = {
        "description_text": description,
        "src": src
    }
    fetch("http://127.0.0.1:5000/post", {
        method: "POST",
        headers: {
            'Authorization': `Token ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json_body)
    }).then(
        (data) => {
            data.json().then(
                posts => {
                    if (!posts.post_id) {
                        error(posts.post_id)
                    } else {
                        document.getElementById("post_modal").style.display = "none"
                    }
                    console.log(posts)
                }
            )
        }

    )
}

//api call to get all the feed posts and then create dom elements accordingly
export let load_feed = (token, create_post, feed_counter) => {
    console.log(`the feed counter is ${feed_counter}`)
    const res = fetch(`http://127.0.0.1:5000/user/feed?p=${feed_counter.count}&n=${3}`, {
            headers: {
                'Authorization': `Token ${token}`
            },
        })
        .then(
            (data) => data.json()
            .then(
                posts => {
                    console.log(posts)
                    posts.posts.map(post => {
                        create_post(post.src, post.meta.description_text, post.meta.author,
                            post.comments, post.meta.published, post.meta.likes, post.id)
                        feed_counter.count += 1
                    })
                }
            )
        )
}

/**
 * This is a sample class API which you may base your code on.
 * You may use this as a launch pad but do not have to.
 */
export default class API {
    /** @param {String} url */
    constructor(url) {
        this.url = url;
    }

    /** @param {String} path */
    makeAPIRequest(path) {
        return getJSON(`${this.url}/${path}`);
    }
}