"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAllRequests() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("requests").select(`
    *,
    teams (
      *
    ),
    request_items(*)
  `);

  if (error) {
    console.error("Error fetching requests:", error);
    return null; // Handle the error as needed
  }

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function createRequest(
  cost,
  date,
  team,
  title,
  desc,
  role,
  author
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .insert([
      {
        cost: cost,
        date: date,
        team_id: team,
        title: title,
        description: desc,
        status: "Pending",
        request_author_type: role,
        request_author_id: author,
      },
    ])
    .select();

  if (error) {
    console.error("Error creating team:", error);
    return error; // Handle the error as needed
  }

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}

export async function createRequestItems(requestId, items) {
  const supabase = await createClient();

  const datas = [];

  for (const item of items) {
    const { data, error } = await supabase
      .from("requests_items")
      .insert([
        {
          request_id: requestId,
          cost: item.cost,
          title: item.title,
          description: item.description,
          link: item.link,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating request item:", error);
      return error; // Handle the error as needed
    }

    datas.push(data);
  }

  if (datas && datas.length > 0) {
    return datas;
  } else {
    return null;
  }
}

export async function updateRequestStatus(id, status) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .update({ status: status })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating request status:", error);
    return error; // Handle the error as needed
  }

  if (data && data.length > 0) {
    return data;
  } else {
    return null;
  }
}
