export async function getBounties() {
  try {
    const result = await fetch('/api/v1/bounty')
    const data = await result.json()
    return data
  } catch (err) {
    console.log(err)
    return []
  }
}
export async function getSeason() {
  try {
    const result = await fetch('/api/v1/season')
    const data = await result.json()
    return data
  } catch (err) {
    console.log(err)
    return {}
  }
}

export async function getTeams(league, season) {
  try {
    const result = await fetch(`/api/v1/team?league=${league}&season=${season}`)
    const data = await result.json()
    return data
  } catch (err) {
    console.log(err)
    return []
  }
}

export async function searchTeams(params) {
  try {
    const qp = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      qp.append(key, value)
    })

    const result = await fetch(`/api/v1/team?${qp.toString()}`)
    const data = await result.json()
    return data
  } catch (err) {
    console.log(err)
    return []
  }
}

export async function getUser() {
  try {
    const result = await fetch('/api/v1/user')
    const data = await result.json()
    return data
  } catch (err) {
    console.log(err)
    return null
  }
}

export async function createBounty(bounty) {
  const result = await fetch('/api/v1/bounty', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bounty),
  })
  return result
}

export async function deleteBounty(bountyId) {
  const result = await fetch(`/api/v1/bounty/${bountyId}`, { method: 'DELETE' })
  return result
}

export async function markBounty(bountyId) {
  const result = await fetch(`/api/v1/bounty/${bountyId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'claimed' }),
  })
  return result
}
